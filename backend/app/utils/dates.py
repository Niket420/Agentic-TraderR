from datetime import date, datetime, timedelta


def to_yyyymmdd(d: date) -> str:
    """Format a date as YYYYMMDD, the format NSE/BSE query params expect."""
    return d.strftime("%Y%m%d")


def trading_day_range(days_back: int, end: date | None = None) -> list[date]:
    """Return a list of calendar dates from `days_back` days ago through `end`
    (inclusive), oldest first. Exchange APIs are queried one day at a time,
    so callers filter out weekends/holidays by simply getting empty results.
    """
    end_date = end or datetime.now().date()
    start_date = end_date - timedelta(days=days_back)
    return [start_date + timedelta(days=i) for i in range((end_date - start_date).days + 1)]
