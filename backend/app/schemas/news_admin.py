from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class NewsArticleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    company_id: int | None
    title: str
    url: str
    source: str | None
    published_at: datetime | None
    fetched_at: datetime
    summary: str | None
    event_type: str | None
    language: str | None
    country: str | None


class AnnouncementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    company_id: int | None
    exchange: str
    announcement_type: str | None
    subject: str
    announcement_date: datetime
    source_url: str | None


class FinancialStatementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    company_id: int
    period_type: str
    period_end_date: date
    fiscal_year: str
    metrics: dict
    source: str


class IngestionRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: str
    started_at: datetime | None
    finished_at: datetime | None
    stats: dict
    error_log: str | None
