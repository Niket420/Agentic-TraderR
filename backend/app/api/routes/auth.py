import secrets

from fastapi import APIRouter, Depends, Response
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import AuthCredentials, AuthUser

router = APIRouter(prefix="/auth", tags=["auth"])

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/login", response_model=AuthUser)
def login(payload: AuthCredentials, response: Response, db: Session = Depends(get_db)) -> AuthUser:
    """Log in by email, creating the user record on first sign-in.

    Note: the current frontend's login call only forwards `email` (see
    frontend/src/api/auth.ts), not the password, so real password
    verification isn't enforced end-to-end yet - this matches the existing
    mock's "any email/password succeeds" behavior rather than silently
    diverging from what the UI actually sends.
    """
    user = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if user is None:
        user = User(email=payload.email, name=payload.email.split("@")[0], password_hash=_pwd_context.hash(secrets.token_hex(16)))
        db.add(user)
        db.commit()
        db.refresh(user)
    response.set_cookie("session_email", user.email, httponly=True, samesite="lax")
    return AuthUser(email=user.email, name=user.name)


@router.post("/signup", response_model=AuthUser)
def signup(payload: AuthCredentials, response: Response, db: Session = Depends(get_db)) -> AuthUser:
    """Create a new user account (or return the existing one for that email)."""
    user = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if user is None:
        name = (payload.name or "").strip() or payload.email.split("@")[0]
        user = User(email=payload.email, name=name, password_hash=_pwd_context.hash(secrets.token_hex(16)))
        db.add(user)
        db.commit()
        db.refresh(user)
    response.set_cookie("session_email", user.email, httponly=True, samesite="lax")
    return AuthUser(email=user.email, name=user.name)


@router.post("/logout", status_code=204)
def logout(response: Response) -> None:
    """Clear the session cookie."""
    response.delete_cookie("session_email")
