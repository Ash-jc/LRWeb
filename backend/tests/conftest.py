"""
Test configuration: uses an in-memory SQLite database via aiosqlite so tests
run without a real Postgres instance.

SQLite limitations handled:
- JSONB columns fall back to JSON (SQLite JSON support is basic but sufficient for tests)
- pgvector extension is skipped in SQLite mode
- UUID columns are stored as strings in SQLite
"""
from __future__ import annotations

import uuid
from typing import AsyncGenerator, Dict

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

# ---------------------------------------------------------------------------
# Override SQLAlchemy models to use SQLite-compatible column types in tests
# ---------------------------------------------------------------------------
# We use the real models but replace the engine.
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def db_engine():
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        # SQLite doesn't support JSONB or UUID natively; SQLAlchemy maps them
        # to TEXT for SQLite, which is fine for testing.
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    session_factory = async_sessionmaker(
        bind=db_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with session_factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def client(db_engine) -> AsyncGenerator[AsyncClient, None]:
    session_factory = async_sessionmaker(
        bind=db_engine, class_=AsyncSession, expire_on_commit=False
    )

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def user_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def auth_headers(user_id: str) -> Dict[str, str]:
    return {"X-User-Id": user_id}
