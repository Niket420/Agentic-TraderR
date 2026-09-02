from datetime import datetime

from app.schemas.normalized import NormalizedAnnouncement


def parse_announcements(raw_records: list[dict]) -> list[NormalizedAnnouncement]:
    """Convert raw BSE corporate-announcement records into the normalized internal model."""
    normalized: list[NormalizedAnnouncement] = []
    for rec in raw_records:
        dt_raw = rec.get("DT_TM") or rec.get("NEWS_DT")
        if not dt_raw:
            continue
        try:
            announcement_date = datetime.fromisoformat(dt_raw)
        except ValueError:
            continue
        scrip_code = rec.get("SCRIP_CD")
        normalized.append(
            NormalizedAnnouncement(
                source="BSE",
                source_id=rec.get("NEWSID"),
                isin=None,
                symbol=str(scrip_code) if scrip_code is not None else None,
                company_name=rec.get("SLONGNAME") or "Unknown",
                announcement_type=rec.get("CATEGORYNAME") or rec.get("SUBCATNAME"),
                subject=rec.get("NEWSSUB") or rec.get("HEADLINE") or "",
                announcement_date=announcement_date,
                source_url=rec.get("NSURL"),
                raw=rec,
            )
        )
    return normalized
