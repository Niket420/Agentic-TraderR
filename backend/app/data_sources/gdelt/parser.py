from datetime import datetime

from app.schemas.normalized import NormalizedNewsArticle


def parse_articles(raw_articles: list[dict]) -> list[NormalizedNewsArticle]:
    """Convert raw GDELT DOC API article records into the normalized internal model."""
    normalized: list[NormalizedNewsArticle] = []
    for rec in raw_articles:
        url = rec.get("url")
        title = rec.get("title")
        if not url or not title:
            continue
        normalized.append(
            NormalizedNewsArticle(
                title=title,
                url=url,
                source=rec.get("domain"),
                published_at=_parse_seendate(rec.get("seendate")),
                language=rec.get("language"),
                country=rec.get("sourcecountry"),
                raw=rec,
            )
        )
    return normalized


def _parse_seendate(value: str | None) -> datetime | None:
    """Parse GDELT's 'YYYYMMDDTHHMMSSZ' seendate format."""
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y%m%dT%H%M%SZ")
    except ValueError:
        return None
