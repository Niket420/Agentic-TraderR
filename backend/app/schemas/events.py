from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

RunEngine = Literal["market_intelligence", "multibagger"]


class ExecutionEvent(BaseModel):
    """Mirrors frontend/src/types/events.ts::ExecutionEvent exactly. `type`
    and `payload` vary per event; payload is left loosely typed here since
    each event constructor below builds the correct shape."""

    model_config = ConfigDict(populate_by_name=True)

    id: str
    run_id: str = Field(alias="runId")
    engine: RunEngine
    timestamp: datetime
    type: str
    payload: dict


def run_started(event_id: str, run_id: str, engine: RunEngine, total_stages: int) -> ExecutionEvent:
    """Build a run.started ExecutionEvent."""
    return ExecutionEvent(
        id=event_id, runId=run_id, engine=engine, timestamp=datetime.utcnow(),
        type="run.started", payload={"totalStages": total_stages},
    )


def run_completed(event_id: str, run_id: str, engine: RunEngine, result_count: int) -> ExecutionEvent:
    """Build a run.completed ExecutionEvent."""
    return ExecutionEvent(
        id=event_id, runId=run_id, engine=engine, timestamp=datetime.utcnow(),
        type="run.completed", payload={"resultCount": result_count},
    )


def run_failed(event_id: str, run_id: str, engine: RunEngine, reason: str) -> ExecutionEvent:
    """Build a run.failed ExecutionEvent."""
    return ExecutionEvent(
        id=event_id, runId=run_id, engine=engine, timestamp=datetime.utcnow(),
        type="run.failed", payload={"reason": reason},
    )


def stage_event(
    event_id: str, run_id: str, engine: RunEngine, stage_type: str, node_id: str, **extra: object
) -> ExecutionEvent:
    """Build a stage.started / stage.progress / stage.completed / stage.failed ExecutionEvent."""
    return ExecutionEvent(
        id=event_id, runId=run_id, engine=engine, timestamp=datetime.utcnow(),
        type=stage_type, payload={"nodeId": node_id, **extra},
    )


def agent_message(
    event_id: str, run_id: str, engine: RunEngine, *, agent: str, company: str, ticker: str,
    text: str, citations: list[str], hypothesis: str | None = None,
) -> ExecutionEvent:
    """Build an agent.message ExecutionEvent."""
    payload = {"agent": agent, "company": company, "ticker": ticker, "text": text, "citations": citations}
    if hypothesis:
        payload["hypothesis"] = hypothesis
    return ExecutionEvent(
        id=event_id, runId=run_id, engine=engine, timestamp=datetime.utcnow(), type="agent.message", payload=payload,
    )


def manager_evaluated(
    event_id: str, run_id: str, engine: RunEngine, *, company: str, ticker: str,
    thesis_strength: float, evidence_quality: float, upside_potential: float, risk: float,
    verdict: str, reasons: list[str], invalidation_conditions: list[str],
) -> ExecutionEvent:
    """Build a manager.evaluated ExecutionEvent."""
    return ExecutionEvent(
        id=event_id, runId=run_id, engine=engine, timestamp=datetime.utcnow(), type="manager.evaluated",
        payload={
            "company": company, "ticker": ticker, "thesisStrength": thesis_strength,
            "evidenceQuality": evidence_quality, "upsidePotential": upside_potential, "risk": risk,
            "verdict": verdict, "reasons": reasons, "invalidationConditions": invalidation_conditions,
        },
    )


def log_emitted(event_id: str, run_id: str, engine: RunEngine, source: str, message: str, level: str) -> ExecutionEvent:
    """Build a log.emitted ExecutionEvent."""
    return ExecutionEvent(
        id=event_id, runId=run_id, engine=engine, timestamp=datetime.utcnow(),
        type="log.emitted", payload={"source": source, "message": message, "level": level},
    )
