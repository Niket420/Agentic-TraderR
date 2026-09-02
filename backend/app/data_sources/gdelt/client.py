import logging
import time

import httpx

logger = logging.getLogger(__name__)

_BASE_URL = "https://api.gdeltproject.org/api/v2/doc/doc"
_MIN_REQUEST_INTERVAL_SEC = 5.0  # GDELT's documented courtesy rate limit


class GDELTClient:
    """Thin HTTP client for the classic GDELT DOC API (no API key required)."""

    def __init__(self) -> None:
        self._client = httpx.Client(timeout=20.0, headers={"User-Agent": "Mozilla/5.0"})
        self._last_request_at = 0.0

    def _respect_rate_limit(self) -> None:
        """Sleep if needed so requests stay at least 5 seconds apart, per GDELT's policy."""
        elapsed = time.monotonic() - self._last_request_at
        if elapsed < _MIN_REQUEST_INTERVAL_SEC:
            time.sleep(_MIN_REQUEST_INTERVAL_SEC - elapsed)

    def search_articles(
        self, query: str, mode: str = "artlist", maxrecords: int = 75, timespan: str = "1d"
    ) -> list[dict]:
        """Query the GDELT DOC API and return the raw article list."""
        self._respect_rate_limit()
        params = {
            "query": query,
            "mode": mode,
            "maxrecords": str(maxrecords),
            "timespan": timespan,
            "format": "json",
        }
        start = time.monotonic()
        response = self._client.get(_BASE_URL, params=params)
        self._last_request_at = time.monotonic()
        response.raise_for_status()
        logger.info("GDELT GET query=%r -> %s in %.2fs", query, response.status_code, time.monotonic() - start)
        try:
            data = response.json()
        except ValueError:
            logger.warning("GDELT returned non-JSON response for query=%r", query)
            return []
        return data.get("articles", []) if isinstance(data, dict) else []

    def close(self) -> None:
        """Release the underlying HTTP connection pool."""
        self._client.close()
