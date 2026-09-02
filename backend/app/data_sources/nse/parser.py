from datetime import datetime

from app.schemas.normalized import NormalizedAnnouncement, NormalizedFinancial, NormalizedShareholding


def _parse_nse_datetime(value: str) -> datetime:
    """Parse NSE's 'DD-Mon-YYYY HH:MM:SS' timestamp format."""
    return datetime.strptime(value, "%d-%b-%Y %H:%M:%S")


def parse_announcements(raw_records: list[dict]) -> list[NormalizedAnnouncement]:
    """Convert raw NSE corporate-announcement records into the normalized internal model."""
    normalized: list[NormalizedAnnouncement] = []
    for rec in raw_records:
        an_dt = rec.get("an_dt") or rec.get("sort_date")
        if not an_dt:
            continue
        try:
            announcement_date = _parse_nse_datetime(an_dt)
        except ValueError:
            continue
        normalized.append(
            NormalizedAnnouncement(
                source="NSE",
                source_id=rec.get("seq_id"),
                isin=rec.get("sm_isin"),
                symbol=rec.get("symbol"),
                company_name=rec.get("sm_name") or rec.get("symbol") or "Unknown",
                announcement_type=rec.get("desc"),
                subject=rec.get("attchmntText") or rec.get("desc") or "",
                announcement_date=announcement_date,
                source_url=rec.get("attchmntFile"),
                raw=rec,
            )
        )
    return normalized


def parse_financial_results(raw_records: list[dict]) -> list[NormalizedFinancial]:
    """Convert raw NSE financial-results records into the normalized internal model."""
    normalized: list[NormalizedFinancial] = []
    for rec in raw_records:
        to_date = rec.get("toDate")
        if not to_date:
            continue
        try:
            period_end = datetime.strptime(to_date, "%d-%b-%Y").date()
        except ValueError:
            continue
        normalized.append(
            NormalizedFinancial(
                source="NSE",
                isin=rec.get("isin"),
                symbol=rec.get("symbol"),
                company_name=rec.get("companyName") or rec.get("symbol") or "Unknown",
                period_type=(rec.get("period") or "quarterly").lower(),
                period_end_date=period_end,
                fiscal_year=rec.get("financialYear") or "",
                metrics=rec,
            )
        )
    return normalized


def parse_shareholding(raw_records: list[dict]) -> list[NormalizedShareholding]:
    """Convert raw NSE shareholding-pattern records into the normalized internal model."""
    normalized: list[NormalizedShareholding] = []
    for rec in raw_records:
        date_str = rec.get("date")
        if not date_str:
            continue
        try:
            as_of = datetime.strptime(date_str, "%d-%b-%Y").date()
        except ValueError:
            continue
        normalized.append(
            NormalizedShareholding(
                source="NSE",
                isin=rec.get("isin"),
                symbol=rec.get("symbol"),
                company_name=rec.get("name") or rec.get("symbol") or "Unknown",
                as_of_date=as_of,
                promoter_pct=_safe_float(rec.get("pr_and_prgrp")),
                public_pct=_safe_float(rec.get("public_val")),
                raw=rec,
            )
        )
    return normalized


def _safe_float(value: object) -> float | None:
    """Parse a numeric string field, returning None if it isn't a valid float."""
    try:
        return float(value) if value not in (None, "") else None
    except (TypeError, ValueError):
        return None
