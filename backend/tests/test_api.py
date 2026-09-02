from datetime import datetime, timezone


def test_health(client):
    """GET /api/health returns 200 and a status field."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_ingestion_run_creation(client, monkeypatch, engine):
    """POST /api/runs/ingestion creates a run and returns it, without touching
    live NSE/BSE/GDELT (the pipeline call is stubbed out for this test)."""
    from sqlalchemy.orm import sessionmaker

    def fake_run_ingestion(db, run=None):
        run.status = "COMPLETED"
        run.started_at = datetime.now(timezone.utc)
        run.finished_at = datetime.now(timezone.utc)
        run.stats = {"nse_announcements": {"fetched": 0, "inserted": 0, "skipped": 0}}
        db.commit()
        return run

    monkeypatch.setattr("app.api.routes.data.run_ingestion", fake_run_ingestion)
    # The background task opens its own session via SessionLocal rather than
    # the request-scoped `client` fixture's session - point it at the same
    # test engine so it sees the run row the POST just created.
    monkeypatch.setattr("app.api.routes.data.SessionLocal", sessionmaker(bind=engine))

    resp = client.post("/api/runs/ingestion")
    assert resp.status_code == 200
    body = resp.json()
    # The response is serialized from the freshly-created row before the
    # background task runs, so it's always PENDING at this point - the
    # background task (stubbed above) updates it to COMPLETED afterward.
    assert body["status"] == "PENDING"
    assert "id" in body

    resp2 = client.get(f"/api/runs/{body['id']}")
    assert resp2.status_code == 200
    assert resp2.json()["id"] == body["id"]
    assert resp2.json()["status"] == "COMPLETED"


def test_get_missing_run_returns_404(client):
    resp = client.get("/api/runs/999999")
    assert resp.status_code == 404


def test_list_companies_empty(client):
    resp = client.get("/api/companies")
    assert resp.status_code == 200
    assert resp.json() == []


def test_auth_login_without_password_succeeds(client):
    """The frontend's login call never sends a password - the API must accept that."""
    resp = client.post("/api/auth/login", json={"email": "test@example.com"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "test@example.com"
