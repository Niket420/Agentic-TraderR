from datetime import datetime, timezone

from app.schemas.normalized import NormalizedAnnouncement
from app.services.announcements.persistence import save_announcements


def _sample(source_id: str = "abc-1") -> NormalizedAnnouncement:
    return NormalizedAnnouncement(
        source="NSE",
        source_id=source_id,
        isin="INE000A00001",
        symbol="TESTCO",
        company_name="Test Company Limited",
        announcement_type="Update",
        subject="Test announcement subject",
        announcement_date=datetime(2026, 1, 1, tzinfo=timezone.utc),
        source_url="https://example.com/doc.pdf",
        raw={"an_dt": "01-Jan-2026"},
    )


def test_save_announcements_inserts_new_records(db_session):
    result = save_announcements(db_session, [_sample()])
    assert result == {"inserted": 1, "skipped": 0}


def test_save_announcements_is_idempotent(db_session):
    """Running the same batch twice must not create duplicate rows."""
    save_announcements(db_session, [_sample()])
    result = save_announcements(db_session, [_sample()])
    assert result == {"inserted": 0, "skipped": 1}

    from app.models.announcement import CorporateAnnouncement

    count = db_session.query(CorporateAnnouncement).count()
    assert count == 1


def test_save_announcements_resolves_company_once(db_session):
    """Two announcements for the same ISIN should resolve to one Company row."""
    save_announcements(db_session, [_sample("abc-1"), _sample("abc-2")])

    from app.models.company import Company

    companies = db_session.query(Company).filter(Company.isin == "INE000A00001").all()
    assert len(companies) == 1
