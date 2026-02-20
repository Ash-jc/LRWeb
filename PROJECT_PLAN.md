# PROJECT_PLAN.md

Interactive Literature Review Web Application

---

## 1. Vision

Build an agent-assisted, interactive literature review platform that allows users to:

* Discover relevant academic papers
* Summarize and group them into structured knowledge
* Explore ideas interactively
* Generate high-quality literature reviews
* Produce visual and presentation outputs
* Use their own LLMs (local or cloud)

The system must support:

* Reproducibility
* Explainability
* Privacy control
* Human-in-the-loop editing
* Deterministic outputs
* Versioned research workflows

---

## 2. Core User Workflow

### Step 1: Create Project

Users create a project with:

* Name
* Domain
* Description
* Retrieval preferences
* Privacy mode

All data is scoped to the project.

---

### Step 2: Connect LLM

Users connect models through:

1. API keys
2. Custom OpenAI-compatible endpoint
3. Optional built-in models

Future:

* OAuth
* Enterprise gateways

Users configure per-task models:

* Summaries
* Taxonomy
* Report writing
* Embeddings

---

### Step 3: Retrieve Papers

Input:

* Keywords
* DOI / arXiv
* Seed papers
* Uploaded PDFs

The system expands via:

* Citation graph
* Semantic similarity
* Metadata search

Each paper stores:

* Inclusion reason
* Confidence score

---

### Step 4: Run Pipeline

A run produces:

* Structured summaries
* Embeddings
* Clusters
* Idea taxonomy
* Graph
* Timeline
* Report
* Exportable artifacts

Runs are immutable and reproducible.

---

### Step 5: Explore Interactively

Users browse:

* Idea Tree
* Paper Graph
* Timeline

They can:

* Filter
* Rename nodes
* Move papers
* Merge or split ideas
* Lock taxonomy

---

### Step 6: Export

Users generate:

* Figures
* Reports
* Slides
* PDF
* Markdown
* LaTeX

Exports reflect the current filters and layout.

---

## 3. System Architecture

### Frontend

* Next.js
* TypeScript
* Tailwind
* D3 or Cytoscape
* Shared state for cross-view filtering

### Backend

* FastAPI
* Celery workers
* Redis
* PostgreSQL + pgvector
* Object storage

---

## 4. LLM Architecture

The system uses a multi-tier LLM structure.

### Tier 1: Reasoning

Used for:

* Taxonomy
* Report writing
* Research gaps

### Tier 2: Bulk summarization

Used for:

* Abstract summaries
* Structured extraction

### Tier 3: Embeddings

Used for:

* Similarity
* Clustering
* Graph edges

All calls go through a Provider Router.

---

## 5. Provider Router

Abstracts:

* Hosted providers
* Local models
* Enterprise gateways

Supports:

* chat
* embeddings
* model listing
* test connection
* usage tracking

---

## 6. Privacy and Security

Secrets:

* Encrypted
* Never logged
* Revocable

Privacy modes:

* Metadata only
* Full text
* Local only

Users control data sharing.

---

## 7. Data Model

Key entities:

* Users
* Projects
* Runs
* Papers
* Summaries
* Embeddings
* Idea tree
* Graph
* Timeline
* Exports
* LLM connections

All versioned and traceable.

---

## 8. Pipeline

1. Retrieval and deduplication
2. PDF parsing
3. Structured summaries
4. Embeddings
5. Clustering
6. Taxonomy labeling
7. Graph building
8. Timeline generation
9. Report writing
10. Export

Caching:

* Summaries
* Embeddings
* Clusters

---

## 9. Interactive Visualization

Must support:

* Smooth performance
* Large graphs
* Filtering
* Linked views
* Persistent layout

---

## 10. Determinism

Each run stores:

* Prompts
* Models
* Settings
* Layout
* Outputs

Exports must be reproducible.

---

## 11. Development Strategy

Follow vertical slices:

* API
* Worker
* UI
* Tests

Priorities:

1. Projects and runs
2. LLM connections
3. Summaries
4. Tree
5. Graph
6. Timeline
7. Exports
8. Optimization

---

## Phase Status

### Phase 1 — MVP (COMPLETE — 2026-02-20)

Delivered:

* Docker Compose stack: Postgres 16 + pgvector, Redis, FastAPI backend, Next.js 14 frontend
* Backend:
  * FastAPI app with CORS, health endpoint
  * SQLAlchemy 2 async ORM: User, Project, Run, Paper, ProjectPaper
  * Pydantic v2 schemas for all entities
  * Alembic migration 001_initial.py (enables pgvector extension)
  * API routers: full CRUD for Projects, Runs (read-only config_snapshot), Papers
  * Stub auth via X-User-Id header (real auth deferred to Phase 2)
* Frontend (Next.js 14 App Router):
  * /projects — project list with cards
  * /projects/new — create project form
  * /projects/[id] — project detail + runs table + "New Run" button
  * /projects/[id]/runs/[runId] — run detail + papers table
  * React Query for data fetching, Tailwind for styling
* Tests:
  * pytest with in-memory SQLite (no Postgres required for unit tests)
  * test_projects.py: CRUD, pagination, ownership isolation
  * test_runs.py: create, list, get, immutability assertion
  * test_papers.py: add, list, dedup, cross-project sharing, 409 conflict
* Docs: TESTING.md populated, PROJECT_PLAN.md updated

### Phase 2 — LLM Connections (NEXT)

Planned:

* LLM connections management (API key + custom endpoint)
* ProviderRouter abstraction (test_connection, list_models, chat, embeddings)
* Per-project model settings
* Real authentication (JWT or session)
* Secret encryption at rest

---

## 12. Performance Goals

Target:

* 50–500 papers
* Up to 2k graph nodes
* Pipeline under 30 minutes

Optimize:

* Parallel processing
* Caching
* Incremental updates

---

## 13. Future Extensions

* Research gap detection
* Trend prediction
* Collaboration
* Continuous monitoring
* Multi-user
* Reference manager integration

---

## 14. Constraints

The system must:

* Work locally or in cloud
* Support privacy-sensitive environments
* Support multiple LLM providers
* Scale to large projects

---

End of PROJECT_PLAN.md
