from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.company import Company


def resolve_or_create_company(
    db: Session, *, isin: str | None, symbol: str | None, name: str, exchange: str
) -> Company | None:
    """Look up a Company by ISIN or exchange symbol, creating one if it doesn't
    exist yet. Returns None if there's no usable identifier at all."""
    if not isin and not symbol:
        return None

    # Use .first() rather than .scalar_one_or_none(): exchange data can
    # legitimately have more than one record resolving to the same symbol
    # (e.g. consolidated vs standalone filings), so tolerate that instead of
    # raising - the first match is an existing, already-resolved company.
    company = None
    if isin:
        company = db.execute(select(Company).where(Company.isin == isin)).scalars().first()
    if company is None and symbol:
        column = Company.nse_symbol if exchange == "NSE" else Company.bse_code
        company = db.execute(select(Company).where(column == symbol)).scalars().first()

    if company is not None:
        _fill_missing_identifiers(company, isin=isin, symbol=symbol, exchange=exchange)
        return company

    company = Company(
        isin=isin,
        name=name,
        nse_symbol=symbol if exchange == "NSE" else None,
        bse_code=symbol if exchange == "BSE" else None,
    )
    db.add(company)
    db.flush()
    return company


def _fill_missing_identifiers(company: Company, *, isin: str | None, symbol: str | None, exchange: str) -> None:
    """Backfill an identifier a company was previously missing (e.g. an NSE
    symbol learned from a later BSE-sourced record with a shared ISIN)."""
    if isin and not company.isin:
        company.isin = isin
    if symbol and exchange == "NSE" and not company.nse_symbol:
        company.nse_symbol = symbol
    if symbol and exchange == "BSE" and not company.bse_code:
        company.bse_code = symbol
