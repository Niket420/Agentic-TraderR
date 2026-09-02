import logging
import time

import httpx

logger = logging.getLogger(__name__)

_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.3"
)
_API_BASE_URL = "https://api.bseindia.com/BseIndiaAPI/api/"
_SITE_BASE_URL = "https://www.bseindia.com"


class BSEClient:
    """Thin HTTP client for BSE's public JSON APIs.

    Unlike NSE, BSE's API does not require a cookie warm-up — a browser-like
    User-Agent plus Origin/Referer headers is sufficient. That detail (and
    the exact undocumented-but-verified endpoint paths) lives here so the
    rest of the app only deals with normalized data.
    """

    def __init__(self) -> None:
        self._client = httpx.Client(
            base_url=_API_BASE_URL,
            headers={
                "User-Agent": _USER_AGENT,
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en-US,en;q=0.5",
                "Origin": _SITE_BASE_URL,
                "Referer": _SITE_BASE_URL,
            },
            timeout=15.0,
            follow_redirects=True,
        )

    def get_json(self, path: str, params: dict | None = None) -> object:
        """Fetch a JSON payload from a BSE API path. BSE sometimes returns a
        JSON-encoded string instead of a JSON object, so callers must handle
        both shapes."""
        # httpx joins a relative path against base_url per RFC 3986: base_url
        # must end with "/" (a directory) and path must NOT start with "/"
        # (or it's treated as domain-root-absolute, dropping the API prefix).
        path = path.lstrip("/")
        start = time.monotonic()
        response = self._client.get(path, params=params)
        response.raise_for_status()
        logger.info("BSE GET %s -> %s in %.2fs", path, response.status_code, time.monotonic() - start)
        return response.json()

    def close(self) -> None:
        """Release the underlying HTTP connection pool."""
        self._client.close()
