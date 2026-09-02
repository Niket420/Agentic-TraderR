from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, get_db
from app.models.announcement import CorporateAnnouncement
from app.models.company import Company
from app.models.financial import FinancialStatement
from app.models.news import NewsArticle
from app.models.run import IngestionRun
from app.pipelines.ingestion import run_ingestion
from app.schemas.company import CompanyOut
from app.schemas.news_admin import AnnouncementOut, FinancialStatementOut, IngestionRunOut, NewsArticleOut

router = APIRouter(tags=["data"])


@router.get("/health")
def health() -> dict:
    """Liveness/readiness check."""
    return {"status": "ok"}


@router.get("/companies", response_model=list[CompanyOut])
def list_companies(limit: int = 100, offset: int = 0, db: Session = Depends(get_db)) -> list[Company]:
    """List ingested companies."""
    return db.execute(select(Company).order_by(Company.name).offset(offset).limit(limit)).scalars().all()


@router.get("/companies/{company_id}", response_model=CompanyOut)
def get_company(company_id: int, db: Session = Depends(get_db)) -> Company:
    """Get one company by id."""
    company = db.get(Company, company_id)
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.get("/companies/{company_id}/news", response_model=list[NewsArticleOut])
def get_company_news(company_id: int, db: Session = Depends(get_db)) -> list[NewsArticle]:
    """List news articles resolved to a company."""
    return db.execute(
        select(NewsArticle).where(NewsArticle.company_id == company_id).order_by(NewsArticle.published_at.desc())
    ).scalars().all()


@router.get("/companies/{company_id}/announcements", response_model=list[AnnouncementOut])
def get_company_announcements(company_id: int, db: Session = Depends(get_db)) -> list[CorporateAnnouncement]:
    """List corporate announcements for a company."""
    return db.execute(
        select(CorporateAnnouncement)
        .where(CorporateAnnouncement.company_id == company_id)
        .order_by(CorporateAnnouncement.announcement_date.desc())
    ).scalars().all()


@router.get("/companies/{company_id}/financials", response_model=list[FinancialStatementOut])
def get_company_financials(company_id: int, db: Session = Depends(get_db)) -> list[FinancialStatement]:
    """List financial statements for a company."""
    return db.execute(
        select(FinancialStatement)
        .where(FinancialStatement.company_id == company_id)
        .order_by(FinancialStatement.period_end_date.desc())
    ).scalars().all()


@router.get("/news", response_model=list[NewsArticleOut])
def list_news(limit: int = 50, db: Session = Depends(get_db)) -> list[NewsArticle]:
    """List the most recently fetched news articles across all companies."""
    return db.execute(select(NewsArticle).order_by(NewsArticle.fetched_at.desc()).limit(limit)).scalars().all()


@router.get("/announcements", response_model=list[AnnouncementOut])
def list_announcements(limit: int = 50, db: Session = Depends(get_db)) -> list[CorporateAnnouncement]:
    """List the most recent corporate announcements across all companies."""
    return db.execute(
        select(CorporateAnnouncement).order_by(CorporateAnnouncement.announcement_date.desc()).limit(limit)
    ).scalars().all()


@router.post("/runs/ingestion", response_model=IngestionRunOut)
def trigger_ingestion(background_tasks: BackgroundTasks, db: Session = Depends(get_db)) -> IngestionRun:
    """Create a PENDING ingestion run and execute it in the background."""
    run = IngestionRun(status="PENDING")
    db.add(run)
    db.commit()
    db.refresh(run)
    background_tasks.add_task(_run_ingestion_background, run.id)
    return run


def _run_ingestion_background(run_id: int) -> None:
    """Run ingestion for an already-created run id, updating that same row in place."""
    db = SessionLocal()
    try:
        run = db.get(IngestionRun, run_id)
        if run is None:
            return
        run_ingestion(db, run=run)
    finally:
        db.close()


@router.get("/runs/{run_id}", response_model=IngestionRunOut)
def get_ingestion_run(run_id: int, db: Session = Depends(get_db)) -> IngestionRun:
    """Get one ingestion run's status and stats."""
    run = db.get(IngestionRun, run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return run
