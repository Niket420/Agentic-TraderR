import logging
import sys

from app.core.config import get_settings


def configure_logging() -> None:
    """Set up a single structured stdout logging handler for the whole app."""
    settings = get_settings()
    root = logging.getLogger()
    root.setLevel(settings.log_level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter("%(asctime)s | %(levelname)-8s | %(name)s | %(message)s")
    )
    root.handlers = [handler]
