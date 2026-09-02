import logging
from datetime import date

from app.data_sources.bse.client import BSEClient
from app.utils.dates import to_yyyymmdd

logger = logging.getLogger(__name__)

_MAX_PAGES = 20  # safety cap; BSE paginates ~50 records/page


def fetch_corporate_announcements(client: BSEClient, day: date) -> list[dict]:
    """Fetch all corporate announcements for every listed company for a single
    trading day from BSE (bulk, not per-company).

    BSE's bulk (no scripcode) query only returns results when strPrevDate ==
    strToDate — a wider date range silently returns an empty payload, so the
    ingestion pipeline calls this once per trading day rather than once for
    a date range.
    """
    day_str = to_yyyymmdd(day)
    logger.info("Fetching BSE corporate announcements for %s", day_str)
    records: list[dict] = []
    for page_no in range(1, _MAX_PAGES + 1):
        data = client.get_json(
            "AnnSubCategoryGetData/w",
            params={
                "pageno": page_no,
                "strCat": "-1",
                "subcategory": "-1",
                "strPrevDate": day_str,
                "strToDate": day_str,
                "strSearch": "P",
                "strType": "C",
            },
        )
        if not isinstance(data, dict):
            break
        page_records = data.get("Table") or []
        records.extend(page_records)
        row_count = _row_count(data)
        if not page_records or len(records) >= row_count:
            break
    logger.info("Fetched %d BSE announcements for %s", len(records), day_str)
    return records


def _row_count(data: dict) -> int:
    """Extract BSE's total-row-count hint (Table1[0].ROWCNT) used for pagination."""
    table1 = data.get("Table1") or []
    if table1 and isinstance(table1[0], dict):
        return int(table1[0].get("ROWCNT", 0))
    return 0
