# Testing Strategy — LRWeb

## Overview

LRWeb uses a layered testing approach:

| Layer | Tool | Scope |
|---|---|---|
| Unit | pytest | Pure functions, schemas, helpers |
| API contract | pytest + httpx AsyncClient | All REST endpoints |
| Integration | pytest + real Postgres | Run against Docker Compose stack |
| E2E (future) | Playwright | Browser flows |

---

## Running Tests

### Backend (recommended — no Docker required)

```bash
cd backend

# Install dev dependencies (first time)
pip install -e ".[test]"

# Run all tests
pytest -v

# Run a specific file
pytest tests/test_projects.py -v

# Run with coverage
pytest --cov=app --cov-report=term-missing
```

The test suite uses **SQLite (aiosqlite)** as an in-memory database, so no
Postgres instance is required for local development or CI.

### Against a live stack

```bash
# Start the full stack
docker compose up -d

# Run tests pointing at the running backend
DATABASE_URL=postgresql+asyncpg://lrweb:lrweb@localhost:5432/lrweb pytest -v
```

---

## Test Structure

```
backend/tests/
├── conftest.py          # Fixtures: in-memory SQLite engine, TestClient, auth headers
├── test_projects.py     # CRUD, pagination, ownership isolation, 404s
├── test_runs.py         # Create, list, get, config_snapshot immutability
└── test_papers.py       # Add paper, dedup, cross-project sharing, 409 conflict
```

### Key fixtures (`conftest.py`)

| Fixture | Scope | Description |
|---|---|---|
| `db_engine` | function | Fresh SQLite in-memory engine per test |
| `db_session` | function | AsyncSession bound to test engine |
| `client` | function | httpx.AsyncClient + dependency override for DB |
| `user_id` | function | Random UUID string |
| `auth_headers` | function | `{"X-User-Id": <uuid>}` |

---

## Coverage Targets

| Area | Target |
|---|---|
| API routers | ≥ 90 % |
| Models / schemas | ≥ 80 % |
| Overall | ≥ 75 % |

---

## Test Policies

1. **Every new endpoint must have a test** — happy path + at least one error case.
2. **No shared state between tests** — each test gets a fresh DB via `db_engine` fixture.
3. **config_snapshot immutability** — `test_runs.py::test_config_snapshot_is_immutable`
   verifies no PATCH endpoint exists that could modify a run's snapshot.
4. **Ownership isolation** — cross-user access must return 404 (not 403) so resource
   existence is not leaked.
5. **No secrets in payloads** — future LLM connection tests must assert that
   `api_key` never appears in response JSON.

---

## CI (future)

```yaml
# .github/workflows/test.yml (placeholder)
- run: pip install -e ".[test]"
- run: pytest -v --cov=app
```

---

## Additions as Project Evolves

Update this file when:
- New test files are added
- New fixtures are introduced
- Coverage targets change
- E2E tests are added (Playwright setup)
- Security / determinism tests are added (§8 CLAUDE.md)
