import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.financial import FinancialStatement
from app.schemas.normalized import NormalizedFinancial
from app.services.companies.resolver import resolve_or_create_company

logger = logging.getLogger(__name__)


def save_financial_statements(db: Session, normalized: list[NormalizedFinancial]) -> dict:
    """Deduplicate and persist normalized financial statements. Idempotent on
    (company, period_type, period_end_date)."""
    inserted = 0
    skipped = 0
    for item in normalized:
        company = resolve_or_create_company(
            db, isin=item.isin, symbol=item.symbol, name=item.company_name, exchange=item.source
        )
        if company is None:
            skipped += 1
            continue

        # .first() rather than scalar_one_or_none(): consolidated and
        # standalone filings for the same period aren't distinguished by
        # this key yet, so more than one existing row can legitimately match.
        exists = db.execute(
            select(FinancialStatement.id).where(
                FinancialStatement.company_id == company.id,
                FinancialStatement.period_type == item.period_type,
                FinancialStatement.period_end_date == item.period_end_date,
            )
        ).scalars().first()
        if exists is not None:
            skipped += 1
            continue

        db.add(
            FinancialStatement(
                company_id=company.id,
                period_type=item.period_type,
                period_end_date=item.period_end_date,
                fiscal_year=item.fiscal_year,
                metrics=item.metrics,
                source=item.source,
            )
        )
        inserted += 1
    db.commit()
    logger.info("Saved financial statements: inserted=%d skipped=%d", inserted, skipped)
    return {"inserted": inserted, "skipped": skipped}
