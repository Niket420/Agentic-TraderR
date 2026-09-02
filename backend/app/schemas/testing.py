from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class PricePoint(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    date: str
    price: float


class TrackedStock(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str
    company: str
    ticker: str
    date_added: date = Field(alias="dateAdded")
    entry_price: float = Field(alias="entryPrice")
    quantity: float | None = None
    current_price: float = Field(alias="currentPrice")
    last_updated: datetime = Field(alias="lastUpdated")
    price_history: list[PricePoint] = Field(alias="priceHistory")
    experiment_id: str | None = Field(default=None, alias="experimentId")
    status: str


class AddStockInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    ticker: str
    company: str | None = None
    date_added: date = Field(alias="dateAdded")
    quantity: float | None = None
    entry_price: float | None = Field(default=None, alias="entryPrice")


class UpdatePricesInput(BaseModel):
    ids: list[str]


class UpdatePricesResult(BaseModel):
    updated: int
    total: int
    timestamp: datetime
    prices: dict[str, float]
