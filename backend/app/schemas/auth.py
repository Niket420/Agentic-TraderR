from pydantic import BaseModel


class AuthUser(BaseModel):
    email: str
    name: str | None = None


class AuthCredentials(BaseModel):
    email: str
    # The frontend's authApi.login/signup only ever forward `email` (and
    # `name` for signup) - password is typed in the UI but dropped before
    # the request is sent (see frontend/src/api/auth.ts). Optional here so
    # that matches reality instead of 422ing on every login.
    password: str | None = None
    name: str | None = None
