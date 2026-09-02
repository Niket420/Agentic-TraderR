from app.data_sources.gdelt.parser import parse_articles

# Fixture shaped like a real GDELT DOC API article (captured from live verification).
RAW_ARTICLE = {
    "url": "https://telecom.economictimes.indiatimes.com/news/industry/jio-platforms-gets-sebi-nod",
    "title": "Jio Platforms IPO: Jio Platforms Secures Sebi Approval",
    "seendate": "20260829T063000Z",
    "domain": "telecom.economictimes.indiatimes.com",
    "language": "English",
    "sourcecountry": "India",
}


def test_parse_articles_maps_fields():
    result = parse_articles([RAW_ARTICLE])
    assert len(result) == 1
    art = result[0]
    assert art.title == RAW_ARTICLE["title"]
    assert art.url == RAW_ARTICLE["url"]
    assert art.source == "telecom.economictimes.indiatimes.com"
    assert art.language == "English"
    assert art.country == "India"
    assert art.published_at.isoformat() == "2026-08-29T06:30:00"


def test_parse_articles_skips_records_without_url_or_title():
    assert parse_articles([{**RAW_ARTICLE, "url": None}]) == []
    assert parse_articles([{**RAW_ARTICLE, "title": None}]) == []


def test_parse_articles_tolerates_bad_seendate():
    raw = {**RAW_ARTICLE, "seendate": "not-a-date"}
    result = parse_articles([raw])
    assert result[0].published_at is None
