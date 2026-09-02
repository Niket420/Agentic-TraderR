import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.data_sources.bse.announcements import fetch_corporate_announcements as fetch_bse_announcements
from app.data_sources.bse.client import BSEClient
from app.data_sources.bse.parser import parse_announcements as parse_bse_announcements
from app.data_sources.gdelt.client import GDELTClient
from app.data_sources.gdelt.news import fetch_india_business_news
from app.data_sources.gdelt.parser import parse_articles as parse_gdelt_articles
from app.data_sources.nse.announcements import fetch_corporate_announcements as fetch_nse_announcements
from app.data_sources.nse.client import NSEClient
from app.data_sources.nse.financials import fetch_financial_results
from app.data_sources.nse.parser import parse_announcements as parse_nse_announcements
from app.data_sources.nse.parser import parse_financial_results
from app.models.run import IngestionRun
from app.services.announcements.persistence import save_announcements
from app.services.financials.persistence import save_financial_statements
from app.services.news.persistence import save_news_articles

logger = logging.getLogger(__name__)


def run_ingestion(db: Session, run: IngestionRun | None = None) -> IngestionRun:
    """Run one full ingestion pass: fetch NSE, BSE, and GDELT independently,
    normalize, deduplicate, and persist each. One source failing does not
    prevent the others from being saved — errors are collected into the run.

    Pass an existing PENDING `run` row (e.g. one already created and returned
    to a client as a run id) to update it in place instead of creating a new one.
    """
    if run is None:
        run = IngestionRun(stats={})
        db.add(run)
    run.status = "RUNNING"
    run.started_at = datetime.now(timezone.utc)
    db.commit()

    stats: dict = {}
    errors: list[str] = []

    stats["nse_announcements"] = _safe_run("NSE announcements", errors, lambda: _ingest_nse_announcements(db))
    stats["nse_financials"] = _safe_run("NSE financials", errors, lambda: _ingest_nse_financials(db))
    stats["bse_announcements"] = _safe_run("BSE announcements", errors, lambda: _ingest_bse_announcements(db))
    stats["gdelt_news"] = _safe_run("GDELT news", errors, lambda: _ingest_gdelt_news(db))

    run.status = "FAILED" if len(errors) == 4 else ("PARTIAL" if errors else "COMPLETED")
    run.finished_at = datetime.now(timezone.utc)
    run.stats = stats
    run.error_log = "\n".join(errors) if errors else None
    db.add(run)
    db.commit()
    db.refresh(run)
    logger.info("Ingestion run %s finished with status=%s", run.id, run.status)
    return run


def _safe_run(label: str, errors: list[str], fn) -> dict:
    """Execute one source's ingestion step, capturing any failure into `errors`
    instead of letting it abort the rest of the pipeline."""
    try:
        return fn()
    except Exception as exc:  # noqa: BLE001 - intentionally broad: isolate one source's failure
        logger.exception("%s ingestion failed", label)
        errors.append(f"{label}: {exc}")
        return {"fetched": 0, "inserted": 0, "skipped": 0, "error": str(exc)}


def _ingest_nse_announcements(db: Session) -> dict:
    """Fetch, parse, and persist NSE corporate announcements."""
    client = NSEClient()
    try:
        raw = fetch_nse_announcements(client)
    finally:
        client.close()
    normalized = parse_nse_announcements(raw)
    result = save_announcements(db, normalized)
    return {"fetched": len(raw), **result}


def _ingest_nse_financials(db: Session) -> dict:
    """Fetch, parse, and persist NSE financial results."""
    client = NSEClient()
    try:
        raw = fetch_financial_results(client)
    finally:
        client.close()
    normalized = parse_financial_results(raw)
    result = save_financial_statements(db, normalized)
    return {"fetched": len(raw), **result}


def _ingest_bse_announcements(db: Session) -> dict:
    """Fetch, parse, and persist BSE corporate announcements for today."""
    client = BSEClient()
    try:
        raw = fetch_bse_announcements(client, datetime.now(timezone.utc).date())
    finally:
        client.close()
    normalized = parse_bse_announcements(raw)
    result = save_announcements(db, normalized)
    return {"fetched": len(raw), **result}


def _ingest_gdelt_news(db: Session) -> dict:
    """Fetch, parse, and persist recent Indian business news from GDELT."""
    client = GDELTClient()
    try:
        raw = fetch_india_business_news(client)
    finally:
        client.close()
    normalized = parse_gdelt_articles(raw)
    result = save_news_articles(db, normalized)
    return {"fetched": len(raw), **result}
