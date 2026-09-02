from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.models.integration import IntegrationCredential
from app.schemas.integrations import ConnectionStatusResponse, IntegrationProvider, SaveCredentialPayload
from app.utils.text import mask_key

router = APIRouter(prefix="/integrations", tags=["integrations"])


def _seed_defaults(db: Session) -> None:
    """Ensure the Groq LLM provider row exists, seeded from GROQ_API_KEY if already configured."""
    existing = db.get(IntegrationCredential, "groq")
    if existing is not None:
        return
    settings = get_settings()
    has_key = bool(settings.groq_api_key)
    db.add(
        IntegrationCredential(
            provider_id="groq",
            category="llm",
            name="Groq",
            description="Groq-hosted LLMs used for research agent reasoning",
            status="connected" if has_key else "disconnected",
            masked_key=mask_key(settings.groq_api_key) if has_key else None,
            last_tested_at=datetime.now(timezone.utc) if has_key else None,
        )
    )
    db.commit()


def _to_schema(row: IntegrationCredential) -> IntegrationProvider:
    """Convert an IntegrationCredential ORM row into its API schema (never includes the raw key)."""
    return IntegrationProvider(
        id=row.provider_id, category=row.category, name=row.name, description=row.description,
        status=row.status, maskedKey=row.masked_key, lastTestedAt=row.last_tested_at,
    )


@router.get("", response_model=list[IntegrationProvider])
def list_providers(db: Session = Depends(get_db)) -> list[IntegrationProvider]:
    """List every configured integration provider, with keys masked."""
    _seed_defaults(db)
    rows = db.execute(select(IntegrationCredential)).scalars().all()
    return [_to_schema(r) for r in rows]


@router.post("/{provider_id}/credential", response_model=IntegrationProvider)
def save_credential(provider_id: str, payload: SaveCredentialPayload, db: Session = Depends(get_db)) -> IntegrationProvider:
    """Store a provider credential. The raw key is never echoed back to the client."""
    row = db.get(IntegrationCredential, provider_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Unknown provider")
    row.encrypted_key = payload.api_key
    row.masked_key = mask_key(payload.api_key)
    row.status = "connected"
    row.last_tested_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(row)
    return _to_schema(row)


@router.post("/{provider_id}/test", response_model=ConnectionStatusResponse)
def test_connection(provider_id: str, db: Session = Depends(get_db)) -> ConnectionStatusResponse:
    """Verify a stored credential is present and mark the provider's status accordingly."""
    row = db.get(IntegrationCredential, provider_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Unknown provider")
    row.status = "connected" if row.encrypted_key else "error"
    row.last_tested_at = datetime.now(timezone.utc)
    db.commit()
    return ConnectionStatusResponse(status=row.status)


@router.delete("/{provider_id}/credential", status_code=204)
def disconnect(provider_id: str, db: Session = Depends(get_db)) -> None:
    """Remove a stored credential and mark the provider disconnected."""
    row = db.get(IntegrationCredential, provider_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Unknown provider")
    row.encrypted_key = None
    row.masked_key = None
    row.status = "disconnected"
    db.commit()
