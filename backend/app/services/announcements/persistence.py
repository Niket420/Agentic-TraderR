import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.announcement import CorporateAnnouncement
from app.schemas.normalized import NormalizedAnnouncement
from app.services.companies.resolver import resolve_or_create_company
from app.utils.deduplication import hash_content, hash_source_id

logger = logging.getLogger(__name__)


def save_announcements(db: Session, normalized: list[NormalizedAnnouncement]) -> dict:
    """Deduplicate and persist normalized announcements. Idempotent: running
    the same batch twice inserts zero additional rows."""
    inserted = 0
    skipped = 0
    for item in normalized:
        dedup_hash = (
            hash_source_id(item.source, item.source_id)
            if item.source_id
            else hash_content(title=item.subject, company=item.company_name, event_date=item.announcement_date.isoformat())
        )
        exists = db.execute(
            select(CorporateAnnouncement.id).where(CorporateAnnouncement.dedup_hash == dedup_hash)
        ).scalar_one_or_none()
        if exists is not None:
            skipped += 1
            continue

        company = resolve_or_create_company(
            db, isin=item.isin, symbol=item.symbol, name=item.company_name, exchange=item.source
        )
        db.add(
            CorporateAnnouncement(
                company_id=company.id if company else None,
                exchange=item.source,
                announcement_type=item.announcement_type,
                subject=item.subject,
                announcement_date=item.announcement_date,
                source_url=item.source_url,
                raw_metadata=item.raw,
                dedup_hash=dedup_hash,
            )
        )
        inserted += 1
    db.commit()
    logger.info("Saved announcements: inserted=%d skipped=%d", inserted, skipped)
    return {"inserted": inserted, "skipped": skipped}
