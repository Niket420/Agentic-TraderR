import re


def normalize_text(value: str) -> str:
    """Lowercase, collapse whitespace, and strip punctuation for stable hashing/matching."""
    lowered = value.lower().strip()
    no_punct = re.sub(r"[^\w\s]", "", lowered)
    return re.sub(r"\s+", " ", no_punct).strip()


def mask_key(raw_key: str) -> str:
    """Mask a secret so only its last 4 characters are visible, e.g. '••••••••9A21'."""
    tail = raw_key[-4:] if len(raw_key) >= 4 else raw_key
    return f"{'•' * 8}{tail}"
