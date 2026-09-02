import logging

from app.data_sources.nse.client import NSEClient

logger = logging.getLogger(__name__)


def fetch_financial_results(client: NSEClient, period: str = "Quarterly") -> list[dict]:
    """Fetch recently filed financial results for all equities from NSE (bulk, not per-company)."""
    logger.info("Fetching NSE financial results (period=%s)", period)
    data = client.get_json(
        "/api/corporates-financial-results",
        params={"index": "equities", "period": period},
        referer="https://www.nseindia.com/companies-listing/corporate-filings-financial-results",
    )
    records = data if isinstance(data, list) else []
    logger.info("Fetched %d NSE financial results", len(records))
    return records


def fetch_shareholding_pattern(client: NSEClient) -> list[dict]:
    """Fetch recently filed shareholding pattern disclosures for all equities from NSE."""
    logger.info("Fetching NSE shareholding pattern filings")
    data = client.get_json(
        "/api/corporate-share-holdings-master",
        params={"index": "equities"},
        referer="https://www.nseindia.com/companies-listing/corporate-filings-shareholding-pattern",
    )
    records = data if isinstance(data, list) else []
    logger.info("Fetched %d NSE shareholding filings", len(records))
    return records
