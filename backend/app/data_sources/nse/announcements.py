import logging

from app.data_sources.nse.client import NSEClient

logger = logging.getLogger(__name__)


def fetch_corporate_announcements(client: NSEClient) -> list[dict]:
    """Fetch today's corporate announcements for all equities from NSE."""
    logger.info("Fetching NSE corporate announcements")
    data = client.get_json(
        "/api/corporate-announcements",
        params={"index": "equities"},
        referer="https://www.nseindia.com/companies-listing/corporate-filings-announcements",
    )
    records = data if isinstance(data, list) else []
    logger.info("Fetched %d NSE announcements", len(records))
    return records
