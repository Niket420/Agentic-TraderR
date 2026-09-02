# TRadex Backend

Python/FastAPI backend for TRadex: automated NSE + BSE + GDELT ingestion into
PostgreSQL, plus the API the existing Vite/React frontend (`../frontend`)
talks to.

## Stack

FastAPI, SQLAlchemy 2.0, PostgreSQL (local, no Docker), Pydantic, httpx, Groq
(behind an internal `llm_service` interface — see `app/services/llm/`).

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

createdb agentictrader          # local Postgres must be running
cp .env.example .env            # fill in GROQ_API_KEY if you have one

uvicorn app.main:app --reload --port 8000
```

Tables are created automatically on startup (`Base.metadata.create_all`) —
no separate migration step for this foundation phase.

## Frontend integration

The frontend expects `frontend/.env.local`:

```
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000/api
```

CORS is controlled by `CORS_ORIGINS` in `.env` (defaults to the Vite dev
server at `http://localhost:5173`).

## API surface

Two surfaces, both under `/api`:

- **Primary — matches `frontend/src/api/*.ts` exactly**: `/research/*`,
  `/multibagger/*` (both including a `POST .../run` that kicks off a
  background run and a `GET .../runs/{id}/events` WebSocket streaming
  `ExecutionEvent`s), `/testing/*`, `/integrations/*`, `/auth/*`.
- **Secondary/admin** — for inspecting ingested data directly:
  `/companies`, `/news`, `/announcements`, `/health`, `/runs/ingestion`,
  `/runs/{id}`.

## Ingestion pipeline

`app/pipelines/ingestion.py::run_ingestion()` fetches NSE, BSE, and GDELT
independently (one source failing doesn't block the others), normalizes,
deduplicates, and upserts into Postgres. Source-specific HTTP/session
details live entirely in `app/data_sources/{nse,bse,gdelt}/` — nothing else
in the app knows about NSE cookies, BSE's undocumented endpoints, or
GDELT's rate limit.

Known live-data caveats (see code comments where relevant):
- NSE needs a cookie warm-up request before its API calls will succeed.
- BSE's bulk announcements endpoint only returns data when queried for a
  single day at a time (`strPrevDate == strToDate`); a date range returns
  nothing. Financial-results snapshots are per-company, not bulk.
- Both NSE and BSE apply IP-level rate limiting/bot-blocking (Akamai on
  BSE) if hit too frequently — expect occasional transient 301/blocked
  responses under heavy testing; the pipeline handles this as a normal
  per-source failure (run status `PARTIAL`), not a crash.
- NSE's bulk financial-results endpoint returns filing *metadata* (with an
  XBRL document link), not parsed P&L numbers — actual numeric financials
  would require XBRL parsing, which isn't implemented yet. The Multibagger
  engine's growth-metric fields are placeholders (0.0) for this reason,
  stated explicitly in its generated bear thesis rather than fabricated.

## Market Intelligence / Multibagger "engines"

`app/pipelines/research.py` and `app/pipelines/multibagger.py` are
intentionally thin placeholders: they read already-ingested data, do a
simple LLM call (Market Intelligence) or rule-based score (Multibagger),
and stream `ExecutionEvent`s over WebSocket in the exact node-id/payload
shape `frontend/src/lib/workflows.ts` and `frontend/src/types/events.ts`
expect. Swapping in a real Bull/Bear/Manager multi-agent pipeline later
only touches these two files — the API contract and frontend don't change.

Both pipeline coroutines push blocking network/LLM calls onto a worker
thread (`asyncio.to_thread`) rather than running them directly on the
event loop — without that, a single in-progress run would freeze the
entire server for every other request until it finished.

## Tests

```bash
createdb agentictrader_test
pytest tests/ -v
```

Parser tests use fixture data captured from real API responses; nothing
in the suite makes live network calls.
