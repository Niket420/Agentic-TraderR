from dataclasses import dataclass, field
from datetime import date, datetime


@dataclass
class NormalizedAnnouncement:
    """Source-agnostic internal representation of a corporate announcement,
    produced by every exchange parser before persistence."""

    source: str
    source_id: str | None
    isin: str | None
    symbol: str | None
    company_name: str
    announcement_type: str | None
    subject: str
    announcement_date: datetime
    source_url: str | None
    raw: dict = field(default_factory=dict)


@dataclass
class NormalizedFinancial:
    """Source-agnostic internal representation of a financial statement filing."""

    source: str
    isin: str | None
    symbol: str | None
    company_name: str
    period_type: str
    period_end_date: date
    fiscal_year: str
    metrics: dict = field(default_factory=dict)


@dataclass
class NormalizedShareholding:
    """Source-agnostic internal representation of a shareholding pattern filing."""

    source: str
    isin: str | None
    symbol: str | None
    company_name: str
    as_of_date: date
    promoter_pct: float | None
    public_pct: float | None
    raw: dict = field(default_factory=dict)


@dataclass
class NormalizedNewsArticle:
    """Source-agnostic internal representation of a news article, produced by
    the GDELT parser before persistence."""

    title: str
    url: str
    source: str | None
    published_at: datetime | None
    language: str | None
    country: str | None
    raw: dict = field(default_factory=dict)
