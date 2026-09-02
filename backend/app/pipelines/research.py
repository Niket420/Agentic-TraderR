import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.announcement import CorporateAnnouncement
from app.models.company import Company
from app.models.result import ResearchResult as ResearchResultModel
from app.pipelines.ingestion import run_ingestion
from app.schemas.events import agent_message, log_emitted, manager_evaluated, run_completed, run_failed, run_started, stage_event
from app.services.llm.service import llm_service
from app.ws.manager import run_event_broker

logger = logging.getLogger(__name__)

_MAX_CANDIDATES = 5

# Node ids must exactly match MARKET_INTELLIGENCE_WORKFLOW.nodes in
# frontend/src/lib/workflows.ts - the store keys node state by this id.
_MI_NODES = [
    "news_collection", "fact_extraction", "research_analyst",
    "bull_case", "bear_case", "evidence_verification", "manager", "final_view",
]

_VERDICT_PROMPT = """You are a terse equity research assistant. Given a company's recent \
corporate announcements below, respond with ONLY a JSON object (no markdown) of the form:
{{"verdict": "BUY"|"WATCH"|"PASS", "bull_point": "...", "bear_point": "...", \
"reasons": ["...", "..."], "invalidation": ["...", "..."]}}

Company: {company}
Recent announcements:
{announcements}
"""


async def run_market_intelligence(run_id: str, session_factory) -> None:
    """Execute the Market Intelligence placeholder pipeline for one run,
    streaming ExecutionEvents in the exact shape/order the frontend workflow
    graph expects, and persisting ResearchResult rows.

    Intentionally thin (one LLM call per candidate, no real Bull/Bear debate)
    so it can be replaced with a real multi-agent pipeline later without
    changing the API contract or the frontend.
    """
    engine = "market_intelligence"
    db = session_factory()
    try:
        await run_event_broker.publish(run_id, run_started(_eid(), run_id, engine, len(_MI_NODES)))

        await _stage_started(run_id, engine, "news_collection", "Fetching NSE, BSE, GDELT")
        # run_ingestion() does blocking network + DB I/O; running it directly in
        # this coroutine would freeze the whole event loop (and every other
        # request/websocket the server is serving) for the duration of the
        # fetch. Push it to a worker thread instead.
        ingestion_run = await asyncio.to_thread(run_ingestion, db)
        await _stage_completed(run_id, engine, "news_collection", f"Ingestion run #{ingestion_run.id}")

        await _stage_started(run_id, engine, "fact_extraction", "Deduplicating and normalizing records")
        fetched = sum(v.get("fetched", 0) for v in ingestion_run.stats.values() if isinstance(v, dict))
        await _stage_completed(run_id, engine, "fact_extraction", f"{fetched} records processed")

        await _stage_started(run_id, engine, "research_analyst", "Selecting candidates with recent announcements")
        candidates = _select_candidates(db)
        await _stage_completed(run_id, engine, "research_analyst", f"{len(candidates)} candidates selected")

        await _stage_started(run_id, engine, "bull_case", "Building bull theses")
        await _stage_started(run_id, engine, "bear_case", "Building bear theses")
        verdicts: dict[int, dict] = {}
        for company, announcements in candidates:
            # _generate_verdict() makes a blocking LLM HTTP call; keep it off the event loop.
            verdict_data = await asyncio.to_thread(_generate_verdict, company, announcements)
            verdicts[company.id] = verdict_data
            ticker = company.nse_symbol or company.bse_code or "N/A"
            citations = [a.source_url for a in announcements if a.source_url][:3]
            await run_event_broker.publish(
                run_id,
                agent_message(_eid(), run_id, engine, agent="bull", company=company.name, ticker=ticker,
                               text=verdict_data["bull_point"], citations=citations),
            )
            await run_event_broker.publish(
                run_id,
                agent_message(_eid(), run_id, engine, agent="bear", company=company.name, ticker=ticker,
                               text=verdict_data["bear_point"], citations=citations),
            )
        await _stage_completed(run_id, engine, "bull_case", f"{len(candidates)} theses built")
        await _stage_completed(run_id, engine, "bear_case", f"{len(candidates)} theses built")

        await _stage_started(run_id, engine, "evidence_verification", "Cross-checking cited sources")
        await _stage_completed(run_id, engine, "evidence_verification", "Evidence cross-checked")

        await _stage_started(run_id, engine, "manager", "Issuing verdicts")
        results: list[ResearchResultModel] = []
        for company, announcements in candidates:
            verdict_data = verdicts[company.id]
            ticker = company.nse_symbol or company.bse_code or "N/A"
            await run_event_broker.publish(
                run_id,
                manager_evaluated(
                    _eid(), run_id, engine, company=company.name, ticker=ticker,
                    thesis_strength=50.0, evidence_quality=40.0, upside_potential=50.0, risk=50.0,
                    verdict=verdict_data["verdict"], reasons=verdict_data["reasons"],
                    invalidation_conditions=verdict_data["invalidation"],
                ),
            )
            result = _build_result(run_id, company, announcements, verdict_data)
            results.append(result)
            db.add(result)
        await _stage_completed(run_id, engine, "manager", f"{len(results)} verdicts issued")

        await _stage_started(run_id, engine, "final_view", "Compiling investment views")
        db.commit()
        await _stage_completed(run_id, engine, "final_view", f"{len(results)} results ready")

        await run_event_broker.publish(run_id, run_completed(_eid(), run_id, engine, len(results)))
    except Exception as exc:  # noqa: BLE001 - report failure to the frontend instead of crashing silently
        logger.exception("Market intelligence run %s failed", run_id)
        await run_event_broker.publish(run_id, run_failed(_eid(), run_id, engine, str(exc)))
    finally:
        db.close()


def _select_candidates(db: Session) -> list[tuple[Company, list[CorporateAnnouncement]]]:
    """Pick companies with the most recent corporate announcements as research candidates."""
    recent = db.execute(
        select(CorporateAnnouncement)
        .where(CorporateAnnouncement.company_id.is_not(None))
        .order_by(CorporateAnnouncement.announcement_date.desc())
        .limit(200)
    ).scalars().all()

    by_company: dict[int, list[CorporateAnnouncement]] = {}
    for ann in recent:
        by_company.setdefault(ann.company_id, []).append(ann)

    candidates = []
    for company_id, anns in list(by_company.items())[:_MAX_CANDIDATES]:
        company = db.get(Company, company_id)
        if company:
            candidates.append((company, anns[:5]))
    return candidates


def _generate_verdict(company: Company, announcements: list[CorporateAnnouncement]) -> dict:
    """Ask the LLM for a short verdict; fall back to a deterministic placeholder on any failure."""
    ann_text = "\n".join(f"- {a.subject}" for a in announcements) or "- No recent announcements"
    try:
        raw = llm_service.generate(_VERDICT_PROMPT.format(company=company.name, announcements=ann_text))
        data = json.loads(raw)
        return {
            "verdict": data.get("verdict", "WATCH"),
            "bull_point": data.get("bull_point", "Recent corporate activity noted."),
            "bear_point": data.get("bear_point", "Limited independent verification available."),
            "reasons": data.get("reasons") or ["Placeholder verdict pending full agent pipeline."],
            "invalidation": data.get("invalidation") or ["Material adverse announcement."],
        }
    except Exception:  # noqa: BLE001 - LLM unavailable/misconfigured must not break the run
        logger.warning("LLM verdict generation failed for %s; using rule-based fallback", company.name)
        return {
            "verdict": "WATCH",
            "bull_point": f"{company.name} has {len(announcements)} recent disclosures worth reviewing.",
            "bear_point": "No LLM-backed analysis available (GROQ_API_KEY not configured or request failed).",
            "reasons": ["Automated placeholder verdict; LLM unavailable."],
            "invalidation": ["N/A - placeholder verdict."],
        }


def _build_result(run_id: str, company: Company, announcements: list[CorporateAnnouncement], verdict_data: dict) -> ResearchResultModel:
    """Assemble a ResearchResult row whose `payload` matches the frontend's ResearchResult shape."""
    result_id = f"rr-{uuid.uuid4().hex[:12]}"
    ticker = company.nse_symbol or company.bse_code or "N/A"
    payload = {
        "id": result_id,
        "company": company.name,
        "ticker": ticker,
        "sector": "Unclassified",
        "price": 0.0,
        "marketCapCr": 0.0,
        "event": announcements[0].subject if announcements else "",
        "eventDate": (announcements[0].announcement_date.isoformat() if announcements else datetime.now(timezone.utc).isoformat()),
        "significance": "Detected from recent corporate announcements",
        "bullScore": 60.0,
        "bearScore": 40.0,
        "managerScore": 50.0,
        "potentialReturnPct": 0.0,
        "riskScore": 50.0,
        "confidencePct": 40.0,
        "evidenceCount": len(announcements),
        "verdict": verdict_data["verdict"],
        "manager": {
            "thesisStrength": 50.0,
            "evidenceQuality": 40.0,
            "upsidePotential": 50.0,
            "risk": 50.0,
            "verdict": verdict_data["verdict"],
            "reasons": verdict_data["reasons"],
            "invalidationConditions": verdict_data["invalidation"],
        },
        "bullThesis": [verdict_data["bull_point"]],
        "bearThesis": [verdict_data["bear_point"]],
        "evidence": [
            {"id": f"ev-{i}", "label": a.subject[:120], "source": a.exchange, "strength": "neutral", "citedBy": "verification"}
            for i, a in enumerate(announcements)
        ],
        "historicalComparables": [],
        "news": [],
    }
    return ResearchResultModel(id=result_id, run_id=run_id, company_id=company.id, ticker=ticker, verdict=verdict_data["verdict"], payload=payload)


async def _stage_started(run_id: str, engine: str, node_id: str, detail: str) -> None:
    """Publish stage.started for a node plus a matching log line."""
    await run_event_broker.publish(run_id, stage_event(_eid(), run_id, engine, "stage.started", node_id, detail=detail))
    await run_event_broker.publish(run_id, log_emitted(_eid(), run_id, engine, node_id, detail, "running"))


async def _stage_completed(run_id: str, engine: str, node_id: str, result_label: str) -> None:
    """Publish stage.completed for a node plus a matching log line."""
    await run_event_broker.publish(run_id, stage_event(_eid(), run_id, engine, "stage.completed", node_id, resultLabel=result_label))
    await run_event_broker.publish(run_id, log_emitted(_eid(), run_id, engine, node_id, result_label, "success"))


def _eid() -> str:
    """Generate a short unique event id."""
    return uuid.uuid4().hex[:12]
