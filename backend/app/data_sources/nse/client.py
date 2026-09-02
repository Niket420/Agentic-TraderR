import logging
import time

import httpx

logger = logging.getLogger(__name__)

_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)
_BASE_URL = "https://www.nseindia.com"


class NSEClient:
    """Thin HTTP client for NSE's public JSON APIs.

    NSE requires a warmed-up session: a normal browser first loads a page
    (which sets anti-bot cookies), then API calls reuse that cookie jar with
    a matching User-Agent and a same-site Referer. This client owns all of
    that so the rest of the app never touches NSE-specific HTTP details.
    """

    def __init__(self) -> None:
        self._client = httpx.Client(
            base_url=_BASE_URL,
            headers={
                "User-Agent": _USER_AGENT,
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "*/*",
            },
            timeout=15.0,
            follow_redirects=True,
        )
        self._warmed_up = False

    def _warm_up(self) -> None:
        """Visit the NSE homepage once to populate cookies required by the API."""
        if self._warmed_up:
            return
        self._client.get("/")
        self._warmed_up = True

    def get_json(self, path: str, params: dict | None = None, referer: str | None = None) -> object:
        """Fetch a JSON payload from an NSE API path, retrying the cookie
        warm-up once if the session appears to have gone stale."""
        self._warm_up()
        headers = {"Referer": referer or f"{_BASE_URL}/"}
        start = time.monotonic()
        response = self._client.get(path, params=params, headers=headers)
        if response.status_code in (401, 403):
            logger.warning("NSE session stale (status=%s), re-warming and retrying", response.status_code)
            self._warmed_up = False
            self._warm_up()
            response = self._client.get(path, params=params, headers=headers)
        response.raise_for_status()
        logger.info("NSE GET %s -> %s in %.2fs", path, response.status_code, time.monotonic() - start)
        return response.json()

    def close(self) -> None:
        """Release the underlying HTTP connection pool."""
        self._client.close()
