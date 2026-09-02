import hashlib
import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.news import NewsArticle
from app.schemas.normalized import NormalizedNewsArticle

logger = logging.getLogger(__name__)


def save_news_articles(db: Session, normalized: list[NormalizedNewsArticle]) -> dict:
    """Deduplicate and persist normalized news articles. Idempotent: running
    the same batch twice inserts zero additional rows."""
    inserted = 0
    skipped = 0
    for item in normalized:
        content_hash = hashlib.sha256(item.url.encode()).hexdigest()
        exists = db.execute(select(NewsArticle.id).where(NewsArticle.content_hash == content_hash)).scalar_one_or_none()
        if exists is not None:
            skipped += 1
            continue

        db.add(
            NewsArticle(
                title=item.title,
                url=item.url,
                source=item.source,
                published_at=item.published_at,
                fetched_at=datetime.now(timezone.utc),
                event_type=None,
                language=item.language,
                country=item.country,
                content_hash=content_hash,
            )
        )
        inserted += 1
    db.commit()
    logger.info("Saved news articles: inserted=%d skipped=%d", inserted, skipped)
    return {"inserted": inserted, "skipped": skipped}
