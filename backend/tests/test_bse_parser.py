from app.data_sources.bse.parser import parse_announcements

# Fixture shaped like a real BSE AnnSubCategoryGetData record (captured from live verification).
RAW_ANNOUNCEMENT = {
    "NEWSID": "833b3aa9-a4a3-4eb5-ae07-b3e5a6c25e91",
    "SCRIP_CD": 526983,
    "NEWSSUB": "Ashoka Refineries Ltd - 526983 - Announcement under Regulation 30 (LODR)",
    "DT_TM": "2026-09-02T16:28:45.18",
    "NEWS_DT": "2026-09-02T16:28:45.18",
    "CATEGORYNAME": "Company Update",
    "SLONGNAME": "Ashoka Refineries Limited",
    "NSURL": "https://www.bseindia.com/stock-share-price/ashoka-refineries-ltd/ashoka/526983/",
}


def test_parse_announcements_maps_fields():
    result = parse_announcements([RAW_ANNOUNCEMENT])
    assert len(result) == 1
    ann = result[0]
    assert ann.source == "BSE"
    assert ann.source_id == "833b3aa9-a4a3-4eb5-ae07-b3e5a6c25e91"
    assert ann.symbol == "526983"
    assert ann.isin is None
    assert ann.company_name == "Ashoka Refineries Limited"
    assert ann.announcement_type == "Company Update"
    assert ann.source_url == RAW_ANNOUNCEMENT["NSURL"]


def test_parse_announcements_skips_records_without_datetime():
    result = parse_announcements([{**RAW_ANNOUNCEMENT, "DT_TM": None, "NEWS_DT": None}])
    assert result == []


def test_parse_announcements_falls_back_to_headline():
    raw = {**RAW_ANNOUNCEMENT, "NEWSSUB": None, "HEADLINE": "Fallback headline text"}
    result = parse_announcements([raw])
    assert result[0].subject == "Fallback headline text"
