import json
import logging

from app.data_sources.bse.client import BSEClient

logger = logging.getLogger(__name__)


def fetch_results_snapshot(client: BSEClient, scripcode: str) -> dict:
    """Fetch the latest financial results snapshot for one BSE-listed company.

    This is a per-company (not bulk) BSE endpoint, so it's used for
    on-demand enrichment of a specific company rather than in the main bulk
    ingestion loop.
    """
    logger.info("Fetching BSE results snapshot for scripcode=%s", scripcode)
    data = client.get_json("TabResults_PAR/w", params={"scripcode": scripcode, "tabtype": "RESULTS"})
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except json.JSONDecodeError:
            logger.warning("BSE results snapshot for %s was not valid JSON", scripcode)
            return {}
    return data if isinstance(data, dict) else {}
