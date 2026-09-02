import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, get_db
from app.models.result import ResearchResult as ResearchResultModel
from app.models.run import EngineRun
from app.pipelines.research import run_market_intelligence
from app.schemas.research import ResearchResult, ResearchRunSummary, StartRunResponse
from app.ws.manager import run_event_broker

router = APIRouter(prefix="/research", tags=["research"])


@router.post("/run", response_model=StartRunResponse)
def start_run(background_tasks: BackgroundTasks, db: Session = Depends(get_db)) -> StartRunResponse:
    """Create a new Market Intelligence run and execute it in the background."""
    run_id = f"run-mi-{uuid.uuid4().hex[:12]}"
    db.add(EngineRun(id=run_id, engine="market_intelligence", status="PENDING"))
    db.commit()
    background_tasks.add_task(run_market_intelligence, run_id, SessionLocal)
    return StartRunResponse(runId=run_id)


@router.get("/runs/{run_id}", response_model=ResearchRunSummary)
def get_run_summary(run_id: str, db: Session = Depends(get_db)) -> ResearchRunSummary:
    """Return summary stats for a Market Intelligence run."""
    result_count = db.execute(
        select(ResearchResultModel).where(ResearchResultModel.run_id == run_id)
    ).scalars().all()
    run = db.get(EngineRun, run_id)
    duration = 0.0
    if run and run.started_at and run.finished_at:
        duration = (run.finished_at - run.started_at).total_seconds()
    return ResearchRunSummary(
        articlesScanned=0, eventsDetected=0, candidatesSelected=len(result_count), runDurationSec=duration,
    )


@router.get("/results", response_model=list[ResearchResult])
def get_results(db: Session = Depends(get_db)) -> list[dict]:
    """Return results from the most recently completed Market Intelligence run."""
    latest_run_id = db.execute(
        select(ResearchResultModel.run_id).order_by(ResearchResultModel.created_at.desc()).limit(1)
    ).scalar_one_or_none()
    if latest_run_id is None:
        return []
    rows = db.execute(
        select(ResearchResultModel).where(ResearchResultModel.run_id == latest_run_id)
    ).scalars().all()
    return [row.payload for row in rows]


@router.websocket("/runs/{run_id}/events")
async def run_events(websocket: WebSocket, run_id: str) -> None:
    """Stream ExecutionEvents for a run as they're published."""
    await run_event_broker.connect(run_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        run_event_broker.disconnect(run_id, websocket)
