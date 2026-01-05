# Task Breakdown: Vault Indexer & Incremental Embeddings

## Overview
Total Tasks: 29

## Task List

### Architecture & Config Foundations
**Dependencies:** None

- [ ] 1.0 Establish embedding strategy abstractions
  - [ ] 1.1 Write 2-4 focused tests for strategy selection and interface compliance (default config picks BGE, OpenAI path works)
  - [ ] 1.2 Define `EmbeddingStrategy` protocol (`embed(texts: list[str]) -> list[Vector]`) and implement `BGEEmbedder` (local) and `OpenAIEmbedder` (cloud) per naming standard
  - [ ] 1.3 Implement `EmbeddingProviderFactory` to read config, apply sane defaults, and fail fast on invalid provider names
  - [ ] 1.4 Document config schema (provider choice, model names, API keys, concurrency caps 2–4) in code comments or README snippet
  - [ ] 1.5 Ensure strategy tests pass (run only tests from 1.1)

**Acceptance Criteria:**
- Strategy interface is minimal and stable; both providers constructed via factory
- Defaults favor local BGE-M3; invalid config surfaces explicit errors
- Tests from 1.1 pass

### Indexing Pipeline (Template Method)
**Dependencies:** Architecture & Config Foundations

- [ ] 2.0 Build indexing pipeline base
  - [ ] 2.1 Write 2-6 focused tests for pipeline ordering and overridable hooks (skip/filter, chunking, embed, upsert, metrics hook on success/failure)
  - [ ] 2.2 Implement `IndexingPipeline.run(file_path)` Template Method with ordered steps: filter/skip → load → chunk → embed → upsert → record metrics; keep hooks small/testable
  - [ ] 2.3 Provide a concrete pipeline implementation wired to chunker/embedding strategy and upsert target (Chroma), honoring validation and error-handling standards
  - [ ] 2.4 Add failure hook to emit structured logs and hand off to retry/dead-letter mechanisms without hiding exceptions
  - [ ] 2.5 Ensure pipeline tests pass (run only tests from 2.1)

**Acceptance Criteria:**
- `run()` is readable, enforces invariant order, and delegates to hook methods
- Hooks cover skip rules, chunking, embedding, upsert, metrics update, and failure logging
- Tests from 2.1 pass

### Queue, Worker, Dead-Letter, Metrics
**Dependencies:** Indexing Pipeline

- [ ] 3.0 Implement queue + worker with retries and metrics
  - [ ] 3.1 Write 2-6 focused tests for dedupe (latest wins), retry max=3, dead-letter logging, and metrics counters
  - [ ] 3.2 Build `IndexingQueue` with deduplication keyed by file path + version/timestamp; expose enqueue API for watcher/backfill
  - [ ] 3.3 Implement `IndexingWorker` consuming queue with concurrency cap (2–4 configurable), running pipeline; enforce retry policy then dead-letter on failure
  - [ ] 3.4 Create `DeadLetterRepository` (file/simple store) capturing file path, error, attempts, timestamp; add view/export helper
  - [ ] 3.5 Implement `MetricsService` exposing queued count, failed count, last processed timestamp; wire updates in queue/worker paths
  - [ ] 3.6 Ensure queue/worker tests pass (run only tests from 3.1)

**Acceptance Criteria:**
- Queue deduplicates superseded tasks; workers respect concurrency cap
- Failed tasks after 3 retries are persisted in dead-letter with details
- Metrics reflect live counts and last processed timestamp
- Tests from 3.1 pass

### Vault Watcher & Filtering
**Dependencies:** Queue, Worker, Dead-Letter, Metrics

- [ ] 4.0 Add vault file watching with debounce and filters
  - [ ] 4.1 Write 2-5 focused tests for filtering (hidden folders, excluded dirs, `.md` only) and debounce/batching behavior
  - [ ] 4.2 Implement `VaultWatcher` using watchdog with 1–2s debounce and batch enqueue; ignore `.obsidian/`, `.trash/`, `node_modules/`, hidden folders, large/binary assets
  - [ ] 4.3 Wire watcher to `IndexingQueue` with dedupe awareness; ensure backpressure friendly error handling
  - [ ] 4.4 Expose config for watch path, debounce duration, and include/exclude globs; validate and log misconfigurations per error-handling standard
  - [ ] 4.5 Ensure watcher tests pass (run only tests from 4.1)

**Acceptance Criteria:**
- Watcher batches events, respects filters, and enqueues only `.md` changes
- Debounce prevents duplicate rapid events; misconfigurations fail fast with clear logs
- Tests from 4.1 pass

### Backfill & Manual Triggers (CLI/API)
**Dependencies:** Vault Watcher & Filtering

- [ ] 5.0 Provide backfill and operator controls
  - [ ] 5.1 Write 2-4 focused tests for startup backfill + manual reindex trigger reusing filters/pipeline
  - [ ] 5.2 Implement startup full crawl using same filtering rules; seed queue without duplicating active items
  - [ ] 5.3 Add CLI/API endpoints for manual reindex trigger, metrics readout, and dead-letter listing; reuse factory/pipeline wiring
  - [ ] 5.4 Add structured logging around enqueue/dequeue, retries, backfill progress, and manual triggers; honor error-handling conventions
  - [ ] 5.5 Ensure backfill/trigger tests pass (run only tests from 5.1)

**Acceptance Criteria:**
- Startup backfill runs once and respects filters/dedupe
- Manual trigger works via CLI/API and surfaces status
- Metrics and dead-letter endpoints return minimal required fields
- Tests from 5.1 pass

### Minimal Metrics Dashboard (UI)
**Dependencies:** Backfill & Manual Triggers

- [ ] 6.0 Build lightweight dashboard
  - [ ] 6.1 Write 2-4 focused tests for rendering counts/timestamps and invoking reindex action
  - [ ] 6.2 Implement Tailwind + shadcn/ui list dashboard showing queued count, failed count, last processed timestamp, and a manual reindex button
  - [ ] 6.3 Ensure responsive layout and accessible semantics (ARIA for button/status), following frontend accessibility/responsive standards
  - [ ] 6.4 Ensure dashboard tests pass (run only tests from 6.1)

**Acceptance Criteria:**
- Dashboard renders minimal metrics and manual trigger; works on mobile/desktop
- Styling follows existing Tailwind/shadcn patterns; accessible controls
- Tests from 6.1 pass

### Test Review & Gap Analysis
**Dependencies:** All prior groups

- [ ] 7.0 Perform feature-level test gap review
  - [ ] 7.1 Review tests from task groups 1–6 (approx 12–33 tests)
  - [ ] 7.2 Identify critical workflow gaps (e2e: watch → queue → worker → pipeline → metrics/dead-letter → UI/API)
  - [ ] 7.3 Add up to 10 targeted tests to cover critical gaps only (no exhaustive edge cases)
  - [ ] 7.4 Run feature-specific test suite only (tests from 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.3)

**Acceptance Criteria:**
- Critical workflows for this spec are covered by a focused set of tests
- No more than 10 additional tests added in 7.3
- Final feature-specific suite passes

The tasks list has created at `agent-os/specs/2025-12-31-vault-indexer-incremental-embeddings/tasks.md`.

Review it closely to make sure it all looks good.

NEXT STEP 👉 Run `/implement-tasks` (simple, effective) or `/orchestrate-tasks` (advanced, powerful) to start building!
