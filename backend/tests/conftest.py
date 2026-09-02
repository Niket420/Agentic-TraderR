import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.models  # noqa: F401 - registers all models on Base.metadata
from app.core.database import Base, get_db
from app.main import app

_TEST_DATABASE_URL = "postgresql+psycopg://niketanand@localhost:5432/agentictrader_test"


@pytest.fixture(scope="session")
def engine():
    """Create all tables once for the test database session."""
    eng = create_engine(_TEST_DATABASE_URL)
    Base.metadata.create_all(bind=eng)
    yield eng
    Base.metadata.drop_all(bind=eng)
    eng.dispose()


@pytest.fixture
def db_session(engine):
    """Yield a plain DB session against the test database, truncating every
    table afterwards. A rollback-only outer transaction doesn't work here
    because the code under test calls session.commit() itself."""
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())


@pytest.fixture
def client(db_session):
    """FastAPI TestClient with the DB dependency overridden to use the test session."""
    from fastapi.testclient import TestClient

    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
