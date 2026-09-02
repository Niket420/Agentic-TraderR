import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, get_db
from app.models.result import MultibaggerCandidate as MultibaggerCandidateModel
from app.models.run import EngineRun
from app.pipelines.multibagger import run_multibagger
from app.schemas.multibagger import MultibaggerCandidate
from app.schemas.research import StartRunResponse
from app.ws.manager import run_event_broker

router = APIRouter(prefix="/multibagger", tags=["multibagger"])


@router.post("/run", response_model=StartRunResponse)
def start_run(background_tasks: BackgroundTasks, db: Session = Depends(get_db)) -> StartRunResponse:
    """Create a new Multibagger run and execute it in the background."""
    run_id = f"run-mb-{uuid.uuid4().hex[:12]}"
    db.add(EngineRun(id=run_id, engine="multibagger", status="PENDING"))
    db.commit()
    background_tasks.add_task(run_multibagger, run_id, SessionLocal)
    return StartRunResponse(runId=run_id)


@router.get("/candidates", response_model=list[MultibaggerCandidate])
def get_candidates(db: Session = Depends(get_db)) -> list[dict]:
    """Return candidates from the most recently completed Multibagger run."""
    latest_run_id = db.execute(
        select(MultibaggerCandidateModel.run_id).order_by(MultibaggerCandidateModel.created_at.desc()).limit(1)
    ).scalar_one_or_none()
    if latest_run_id is None:
        return []
    rows = db.execute(
        select(MultibaggerCandidateModel).where(MultibaggerCandidateModel.run_id == latest_run_id)
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
