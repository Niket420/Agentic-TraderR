import logging
from collections import defaultdict

from fastapi import WebSocket

from app.schemas.events import ExecutionEvent

logger = logging.getLogger(__name__)


class RunEventBroker:
    """Fans out ExecutionEvents for a run to any connected WebSocket clients.

    Also keeps a per-run history buffer so a client that connects slightly
    after the run started (a real possibility: POST /run returns, then the
    frontend opens the WebSocket) still gets the events it missed.
    """

    def __init__(self) -> None:
        self._connections: dict[str, list[WebSocket]] = defaultdict(list)
        self._history: dict[str, list[ExecutionEvent]] = defaultdict(list)

    async def connect(self, run_id: str, websocket: WebSocket) -> None:
        """Accept a WebSocket connection and replay any events already emitted for this run."""
        await websocket.accept()
        self._connections[run_id].append(websocket)
        for event in self._history[run_id]:
            await websocket.send_text(event.model_dump_json(by_alias=True))

    def disconnect(self, run_id: str, websocket: WebSocket) -> None:
        """Remove a closed WebSocket connection from the run's subscriber list."""
        if websocket in self._connections[run_id]:
            self._connections[run_id].remove(websocket)

    async def publish(self, run_id: str, event: ExecutionEvent) -> None:
        """Record an event and push it to every currently connected client for this run."""
        self._history[run_id].append(event)
        dead: list[WebSocket] = []
        for ws in self._connections[run_id]:
            try:
                await ws.send_text(event.model_dump_json(by_alias=True))
            except Exception:  # noqa: BLE001 - a closed/broken socket shouldn't stop the run
                dead.append(ws)
        for ws in dead:
            self.disconnect(run_id, ws)


run_event_broker = RunEventBroker()
