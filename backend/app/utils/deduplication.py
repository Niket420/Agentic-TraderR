import hashlib

from app.utils.text import normalize_text


def hash_source_id(source: str, source_id: str) -> str:
    """Deterministic dedup key when the upstream source provides a stable ID
    (e.g. BSE's NEWSID, NSE's seq_id)."""
    return hashlib.sha256(f"{source}:{source_id}".encode()).hexdigest()


def hash_content(*, title: str, company: str, event_date: str) -> str:
    """Deterministic dedup key when no stable source ID exists: a hash of the
    normalized title, company, and date."""
    key = f"{normalize_text(title)}|{normalize_text(company)}|{event_date}"
    return hashlib.sha256(key.encode()).hexdigest()
