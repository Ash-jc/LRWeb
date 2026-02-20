# CLAUDE.md
Guidelines for Claude Code when working on the Interactive Literature Review Web Application

---

## 0. Project Overview

This project is an agent-assisted, interactive literature review platform.

Users create Projects, run versioned Pipelines (“Runs”) that:
- discover relevant papers
- parse PDFs (where allowed)
- generate structured summaries
- embed and cluster papers into an idea taxonomy (tree)
- produce interactive visualizations (tree, graph, timeline)
- generate reports and slide decks
- export artifacts (PNG/PDF/PPTX/MD/TEX)

The system must prioritize:
- reproducibility (run snapshots)
- explainability (why included / why grouped)
- deterministic exports (stable layouts)
- human-in-the-loop editing (overrides)
- provider-agnostic LLM integration (Bring Your Own Model)

---

## 1. Key Product Requirements

### 1.1 Project-first workspace
All data belongs to a user-created Project:
- papers, runs, summaries, embeddings, taxonomy, graph layouts, exports
Nothing is “global” unless explicitly designed as shared cache.

### 1.2 Interactive views
Provide interactive:
- Ideas Tree (taxonomy)
- Paper Graph (network)
- Timeline (chronological map)
All views must be linked (selection and filters propagate).

### 1.3 Outputs
Per Run, allow exporting:
- tree diagram (PNG/JPG/PDF/PPTX)
- paper graph (PNG/JPG/PDF/PPTX)
- timeline (PNG/JPG/PDF/PPTX)
- literature review report (Markdown and/or LaTeX + BibTeX)
- slide deck (PPTX; Google Slides sync is optional/Phase 2)

---

## 2. LLM Integration (Bring Your Own Model)

### 2.1 Connection modes (Phase 1)
Implement at minimum:
1) API Key connections (hosted providers)
2) Custom OpenAI-compatible endpoint connections (base_url + optional token)
Optional: Built-in/demo model mode for onboarding
3) Local models of users (ollama, deepseek, LM Studio, etc.)

Phase 2:
- OAuth only when provider supports third-party API access tokens via OAuth
- Enterprise gateway mode (org-managed endpoint)

Important: Do NOT assume consumer subscriptions (e.g., “Plus/Pro”) automatically grant API access.

### 2.2 Provider Router (required)
Implement a backend abstraction layer (ProviderRouter) so pipeline code is provider-agnostic.

Router must support:
- test_connection()
- list_models() (best-effort; some providers may not support)
- chat_completions()
- embeddings()

Router must:
- never log secrets
- record usage metrics (tokens, latency; cost best-effort)
- enforce project/user limits (max tokens/run, max spend/day, max concurrency)
- support timeouts and retries

### 2.3 Per-project model settings
A Project must have settings mapping tasks → (connection_id, model_name):
- bulk summarization
- taxonomy labeling / hierarchy building
- report writing
- embeddings

A Run must store an immutable config_snapshot:
- chosen connection IDs
- model names
- prompt versions
- clustering params
- privacy mode

---

## 3. Privacy & Security Rules (non-negotiable)

- Secrets must be encrypted at rest (KMS/Vault or equivalent).
- Never store secrets in frontend localStorage.
- Never print secrets in logs, errors, or traces.
- Add “Test connection” without leaking secrets.
- Provide delete/revoke for connections.
- Implement privacy modes:
  - metadata-only (title/abstract)
  - fulltext allowed (PDF text)
  - local-only (no external endpoints)

Never run destructive commands or delete user data without explicit user instruction.

---

## 4. Determinism & Versioning

- Never overwrite historical results for a Run.
- Store graph node positions so the layout is stable on reload and export.
- Export routes must be deterministic (print-friendly pages).
- Store prompt versions and model identifiers used for each Run.

Caching rules:
- Cache summaries by (paper_id, model, prompt_version, privacy_mode)
- Cache embeddings by (paper_id, embedding_model)
- Cache cluster labels by (cluster_signature, model, prompt_version)

---

## 5. Architecture

### Frontend
- Next.js + TypeScript + Tailwind
- Visualization: D3 for tree/timeline; graph may use Cytoscape/Sigma for scale
- Shared selection/filter state for cross-view linking

### Backend
- FastAPI (typed, Pydantic)
- Workers: Celery (or equivalent) + Redis
- Postgres + pgvector
- Object storage for PDFs and exports

---

## 6. Data Model (minimum required entities)

- users
- projects
- runs (with immutable config_snapshot)
- papers (canonical)
- project_papers (inclusion reason + score)
- paper_text (parsed text references)
- paper_summaries (structured, versioned)
- embeddings
- idea_nodes (tree per run)
- paper_assignments (paper → node, confidence, rationale)
- graph_nodes + graph_edges (per run; includes stored layout)
- exports (artifact records)
- llm_connections
- project_llm_settings

Never overwrite; create new records per run/version.

---

## 7. Pipeline Steps (Run)

Order:
1) Retrieval + dedupe (non-LLM)
2) PDF fetch/parse (non-LLM)
3) Summaries (LLM via Router)
4) Embeddings (via Router)
5) Clustering (non-LLM)
6) Cluster labeling + tree building (LLM)
7) Graph edges + layout (non-LLM)
8) Timeline aggregation (non-LLM)
9) Report writing (LLM)
10) Exports (Playwright + PPTX generator) (non-LLM)

Store progress events for UI polling.

---

## 8. Testing Requirements

Always include:
- Unit tests for dedupe, caching keys, router adapters
- API contract tests (Pydantic schemas)
- Worker task tests (idempotency, retries)
- Determinism tests:
  - same run snapshot reproduces same outputs/layout
- Security tests:
  - ensure secrets never appear in logs/serialized payloads

---

## 9. Implementation Style Rules for Claude Code

- Plan before coding (short bullet plan).
- Make small, PR-sized diffs.
- Add/update tests with every feature.
- Update README when architecture changes.
- Avoid breaking changes; migrate DB properly.
- Prefer vertical slices (API + worker + UI + tests).
- When uncertain, choose the simplest shippable approach.

---

## 10. Roadmap Priority

1) Projects + Runs + Papers list
2) LLM Connections + ProviderRouter + Project model settings
3) Summaries + Paper detail panel
4) Taxonomy tree + edit overrides
5) Graph + stored layout
6) Timeline + linked brushing
7) Exports (PNG/PDF/PPTX) + Report (MD/TEX) + Slides
8) Optimization and enterprise features (OAuth, gateway, collaboration)

---

## 11. Self-evolving

Update the project docs (including the guidline markdown files) as the project evolves if necessary or enconter any change of plans or directions.

---
End of CLAUDE.md
