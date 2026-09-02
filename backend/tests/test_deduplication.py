from app.utils.deduplication import hash_content, hash_source_id


def test_hash_source_id_is_deterministic():
    a = hash_source_id("NSE", "12345")
    b = hash_source_id("NSE", "12345")
    assert a == b


def test_hash_source_id_differs_by_source():
    assert hash_source_id("NSE", "12345") != hash_source_id("BSE", "12345")


def test_hash_content_ignores_case_and_whitespace():
    a = hash_content(title="Board Meeting  Intimation", company="Acme Ltd", event_date="2026-01-01")
    b = hash_content(title="board meeting intimation", company="ACME LTD", event_date="2026-01-01")
    assert a == b


def test_hash_content_differs_by_date():
    a = hash_content(title="Board Meeting", company="Acme Ltd", event_date="2026-01-01")
    b = hash_content(title="Board Meeting", company="Acme Ltd", event_date="2026-01-02")
    assert a != b
