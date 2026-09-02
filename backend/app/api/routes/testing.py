import hashlib
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.tracked_stock import TrackedStock as TrackedStockModel
from app.schemas.testing import AddStockInput, TrackedStock, UpdatePricesInput, UpdatePricesResult

router = APIRouter(prefix="/testing", tags=["testing"])


def _to_schema(row: TrackedStockModel) -> TrackedStock:
    """Convert a TrackedStock ORM row into its API schema."""
    return TrackedStock.model_validate(row, from_attributes=True)


@router.get("/stocks", response_model=list[TrackedStock])
def list_stocks(db: Session = Depends(get_db)) -> list[TrackedStockModel]:
    """List every stock currently tracked in the Testing Lab."""
    return db.execute(select(TrackedStockModel)).scalars().all()


@router.post("/stocks", response_model=TrackedStock)
def add_stock(payload: AddStockInput, db: Session = Depends(get_db)) -> TrackedStockModel:
    """Add a new stock pick to the Testing Lab, using its entry price as the current price."""
    now = datetime.now(timezone.utc)
    entry_price = payload.entry_price if payload.entry_price is not None else _placeholder_price(payload.ticker)
    row = TrackedStockModel(
        id=f"ts-{uuid.uuid4().hex[:12]}",
        company=payload.company or payload.ticker.upper(),
        ticker=payload.ticker.upper(),
        date_added=payload.date_added,
        entry_price=entry_price,
        quantity=payload.quantity,
        current_price=entry_price,
        last_updated=now,
        price_history=[
            {"date": payload.date_added.isoformat(), "price": entry_price},
            {"date": now.isoformat(), "price": entry_price},
        ],
        status="active",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.post("/prices/update", response_model=UpdatePricesResult)
def update_prices(payload: UpdatePricesInput, db: Session = Depends(get_db)) -> UpdatePricesResult:
    """Refresh the current price for the given tracked stocks.

    Live market-data ingestion isn't wired up yet, so this keeps prices
    unchanged rather than fabricating a price movement.
    """
    now = datetime.now(timezone.utc)
    rows = db.execute(select(TrackedStockModel).where(TrackedStockModel.id.in_(payload.ids))).scalars().all()
    prices: dict[str, float] = {}
    for row in rows:
        row.last_updated = now
        prices[row.id] = row.current_price
    db.commit()
    return UpdatePricesResult(updated=len(rows), total=len(payload.ids), timestamp=now, prices=prices)


def _placeholder_price(ticker: str) -> float:
    """Derive a stable placeholder price from the ticker until live quotes are ingested."""
    seed = int(hashlib.sha256(ticker.upper().encode()).hexdigest(), 16)
    return round(40 + (seed % 4600) / 10, 2)
