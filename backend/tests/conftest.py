"""Shared pytest fixtures for the Maintenance Request Tracker API.

Creates an in-memory SQLite database so tests never touch the
production Neon PostgreSQL instance.  The Groq AI calls are
patched globally so tests run instantly without consuming API quota.
"""

from collections.abc import Generator
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import StaticPool, create_engine
from sqlalchemy.orm import Session, sessionmaker

# ── Patch the Groq client BEFORE any app code is imported ──────────
# ai_logic.py creates a Groq(api_key=...) at module level, which
# would fail without a real key.  We also need to mock the two
# functions that crud.py calls so every test gets deterministic output.

_mock_suggest = patch(
    "app.core.ai_logic.suggest_category",
    return_value="Plumbing",
)
_mock_summary = patch(
    "app.core.ai_logic.generate_summary",
    return_value="Leaking pipe in kitchen",
)
_mock_groq_client = patch("app.core.ai_logic.Groq")

# Start the patches before the app modules are imported
_mock_groq_client.start()
_mock_suggest.start()
_mock_summary.start()

# NOW it is safe to import app code
from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402

# ── In-memory SQLite engine ────────────────────────────────────────
SQLALCHEMY_TEST_URL = "sqlite://"

test_engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine,
)


def _override_get_db() -> Generator[Session, None, None]:
    """Yield a session bound to the in-memory SQLite database."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Replace the production DB dependency with the test one
app.dependency_overrides[get_db] = _override_get_db


# ── Fixtures ───────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def _setup_tables():
    """Create all tables before each test, drop them after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def client() -> TestClient:
    """Return a FastAPI TestClient wired to the in-memory DB."""
    return TestClient(app)


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    """Provide a raw SQLAlchemy session for direct DB assertions."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
