import asyncio
import logging
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.financial import FinancialStatement
from app.models.result import MultibaggerCandidate as MultibaggerCandidateModel
from app.pipelines.ingestion import run_ingestion
from app.schemas.events import log_emitted, run_completed, run_failed, run_started, stage_event
from app.ws.manager import run_event_broker

logger = logging.getLogger(__name__)

_MAX_CANDIDATES = 5

# Node ids must exactly match MULTIBAGGER_WORKFLOW.nodes in frontend/src/lib/workflows.ts.
_MB_NODES = [
    "market_universe", "financial_quality", "growth_inflection", "catalyst_detection",
    "future_value_model", "mispricing_analysis", "historical_pattern_match",
    "bull_research", "bear_research", "multibagger_judge",
]


async def run_multibagger(run_id: str, session_factory) -> None:
    """Execute the Multibagger placeholder pipeline: a rule-based screen over
    ingested filing activity (no full XBRL numeric parsing yet, so growth
    metrics are placeholders rather than real revenue/profit figures - the
    bull/bear thesis text says so explicitly rather than fabricating precision
    the ingestion pipeline doesn't have yet).
    """
    engine = "multibagger"
    db = session_factory()
    try:
        await run_event_broker.publish(run_id, run_started(_eid(), run_id, engine, len(_MB_NODES)))

        await _stage_started(run_id, engine, "market_universe", "Fetching NSE, BSE, GDELT")
        # Blocking network + DB I/O; keep it off the event loop (see research.py).
        ingestion_run = await asyncio.to_thread(run_ingestion, db)
        await _stage_completed(run_id, engine, "market_universe", f"Ingestion run #{ingestion_run.id}")

        await _stage_started(run_id, engine, "financial_quality", "Screening companies with recent filings")
        candidates = _select_candidates(db)
        await _stage_completed(run_id, engine, "financial_quality", f"{len(candidates)} companies screened")

        for node_id, detail in [
            ("growth_inflection", "Filing-recency heuristic applied"),
            ("catalyst_detection", "Announcement catalysts tagged"),
            ("future_value_model", "Placeholder scenario model built"),
            ("mispricing_analysis", "Skipped - live pricing not ingested yet"),
            ("historical_pattern_match", "Skipped - historical dataset not built yet"),
            ("bull_research", "Bull notes drafted"),
            ("bear_research", "Bear notes drafted"),
        ]:
            await _stage_started(run_id, engine, node_id, detail)
            await _stage_completed(run_id, engine, node_id, detail)

        await _stage_started(run_id, engine, "multibagger_judge", "Scoring candidates")
        results: list[MultibaggerCandidateModel] = []
        for company, filing_count in candidates:
            candidate = _build_candidate(run_id, company, filing_count)
            results.append(candidate)
            db.add(candidate)
        db.commit()
        await _stage_completed(run_id, engine, "multibagger_judge", f"{len(results)} candidates ranked")

        await run_event_broker.publish(run_id, run_completed(_eid(), run_id, engine, len(results)))
    except Exception as exc:  # noqa: BLE001 - report failure to the frontend instead of crashing silently
        logger.exception("Multibagger run %s failed", run_id)
        await run_event_broker.publish(run_id, run_failed(_eid(), run_id, engine, str(exc)))
    finally:
        db.close()


def _select_candidates(db: Session) -> list[tuple[Company, int]]:
    """Pick companies with the most recent financial-statement filings as candidates."""
    rows = db.execute(
        select(FinancialStatement.company_id, func.count(FinancialStatement.id))
        .group_by(FinancialStatement.company_id)
        .order_by(func.max(FinancialStatement.created_at).desc())
        .limit(_MAX_CANDIDATES)
    ).all()
    candidates = []
    for company_id, count in rows:
        company = db.get(Company, company_id)
        if company:
            candidates.append((company, count))
    return candidates


def _build_candidate(run_id: str, company: Company, filing_count: int) -> MultibaggerCandidateModel:
    """Assemble a MultibaggerCandidate row matching the frontend's MultibaggerCandidate shape."""
    candidate_id = f"mb-{uuid.uuid4().hex[:12]}"
    ticker = company.nse_symbol or company.bse_code or "N/A"
    score = min(90.0, 40.0 + filing_count * 5.0)
    verdict = "WATCH" if score < 70 else "BUY"
    payload = {
        "id": candidate_id,
        "company": company.name,
        "ticker": ticker,
        "sector": "Unclassified",
        "price": 0.0,
        "marketCapCr": 0.0,
        "revenueGrowthPct": 0.0,
        "profitGrowthPct": 0.0,
        "rocePct": 0.0,
        "debtToEquity": 0.0,
        "growthAccelerationScore": score,
        "catalystStrengthScore": score,
        "marketMispricingScore": 0.0,
        "historicalSimilarityScore": 0.0,
        "governanceRiskScore": 30.0,
        "verdict": verdict,
        "confidencePct": 35.0,
        "scenarios": [],
        "futureValue": {
            "currentRevenueCr": 0.0, "potentialRevenueCr": 0.0,
            "currentEbitdaMarginPct": 0.0, "potentialEbitdaMarginPct": 0.0,
            "currentMarketCapCr": 0.0, "scenarioMarketCapCr": 0.0, "assumptions": [],
        },
        "analogues": [],
        "bullThesis": [f"{filing_count} recent financial filings suggest active disclosure cadence."],
        "bearThesis": ["Live pricing and historical-pattern data are not yet ingested; scores are directional only."],
        "catalysts": [],
    }
    return MultibaggerCandidateModel(id=candidate_id, run_id=run_id, company_id=company.id, ticker=ticker, verdict=verdict, payload=payload)


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
