from app.data_sources.nse.parser import parse_announcements, parse_financial_results, parse_shareholding

# Fixtures shaped like real NSE API responses (captured from live verification).

RAW_ANNOUNCEMENT = {
    "an_dt": "02-Sep-2026 16:08:21",
    "attchmntFile": "https://nsearchives.nseindia.com/corporate/team_x_ANN.pdf",
    "attchmntText": "Disclosure under SEBI Takeover Regulations.",
    "desc": "Disclosure under SEBI Takeover Regulations",
    "seq_id": "106766124",
    "sm_isin": "INE926K01017",
    "sm_name": "Asian Hotels (East) Limited",
    "sort_date": "2026-09-02 16:08:21",
    "symbol": "AHLEAST",
}

RAW_FINANCIAL = {
    "companyName": "V.S.T Tillers Tractors Limited",
    "financialYear": "01-Apr-2024 To 31-Mar-2025",
    "isin": "INE764D01017",
    "period": "Quarterly",
    "symbol": "VSTTILLERS",
    "toDate": "31-Dec-2024",
}

RAW_SHAREHOLDING = {
    "date": "30-JUN-2026",
    "isin": "INE117A01014",
    "name": "ABB India Limited",
    "pr_and_prgrp": "75",
    "public_val": "25",
    "symbol": "ABB",
}


def test_parse_announcements_maps_fields():
    result = parse_announcements([RAW_ANNOUNCEMENT])
    assert len(result) == 1
    ann = result[0]
    assert ann.source == "NSE"
    assert ann.source_id == "106766124"
    assert ann.isin == "INE926K01017"
    assert ann.symbol == "AHLEAST"
    assert ann.company_name == "Asian Hotels (East) Limited"
    assert ann.announcement_date.isoformat() == "2026-09-02T16:08:21"


def test_parse_announcements_skips_records_without_date():
    result = parse_announcements([{**RAW_ANNOUNCEMENT, "an_dt": None, "sort_date": None}])
    assert result == []


def test_parse_financial_results_maps_fields():
    result = parse_financial_results([RAW_FINANCIAL])
    assert len(result) == 1
    fin = result[0]
    assert fin.source == "NSE"
    assert fin.symbol == "VSTTILLERS"
    assert fin.period_type == "quarterly"
    assert fin.period_end_date.isoformat() == "2024-12-31"
    assert fin.metrics == RAW_FINANCIAL


def test_parse_shareholding_maps_and_converts_percentages():
    result = parse_shareholding([RAW_SHAREHOLDING])
    assert len(result) == 1
    sh = result[0]
    assert sh.promoter_pct == 75.0
    assert sh.public_pct == 25.0
    assert sh.as_of_date.isoformat() == "2026-06-30"


def test_parse_shareholding_handles_missing_percentages():
    raw = {**RAW_SHAREHOLDING, "pr_and_prgrp": "", "public_val": None}
    result = parse_shareholding([raw])
    assert result[0].promoter_pct is None
    assert result[0].public_pct is None
