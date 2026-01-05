Implementation is written by the user; AI provides design/review and minimal diffs only.

# Specification: Vault Indexer & Incremental Embeddings

## Goal
Keep a Chroma index in near-real-time sync with an Obsidian vault by watching `.md` files, batching debounced changes into an embedding queue, and exposing minimal health signals and controls.

## User Stories
- As an Obsidian user, I want vault changes to be indexed automatically so answers stay grounded in my latest notes.
- As a builder, I want to limit resource usage (concurrency, retries) so the indexer does not overwhelm my machine.
- As an operator, I want a manual reindex trigger and basic metrics so I can recover from drift or failures.

## Specific Requirements

**Vault watching & filtering**
- Use `watchdog` to monitor the vault; apply 1–2s debounce and batch events before enqueue.
- Exclude `.obsidian/`, `.trash/`, `node_modules/`, all hidden folders, and large/binary asset dirs; index `.md` only.
- Respect CPU by default: concurrency cap 2–4 workers; make configurable.

**Indexing queue, retries, and dead-letter**
- Enqueue deduped tasks per file (latest version only); drop superseded items before work.
- Retry each task max 3 times; after that, write to a dead-letter log (file or simple store) with error details for later replay.
- Provide minimal metrics: queued count, failed count, last processed timestamp; surface in a lightweight list dashboard.

**Backfill & manual triggers**
- Run one full crawl at startup to sync DB; same filtering rules as watcher.
- Expose a manual reindex trigger (CLI/API endpoint) to re-run full indexing on demand.

**Embedding provider Strategy (interchangeable)**
- Define a small interface/protocol `EmbeddingStrategy` (e.g., `embed(texts: list[str]) -> list[Vector]`) to swap providers without conditionals.
- Implement `BGEEmbedder` (local) and `OpenAIEmbedder` (cloud) strategies; choose globally via config.
- Add a simple factory/wiring class `EmbeddingProviderFactory` to read config and return the selected strategy.

**Indexing pipeline Template Method (invariant flow)**
- Define a base `IndexingPipeline` with `run(file_path)` that orders steps: filter/skip → load → chunk → embed → upsert → record metrics.
- Expose overridable hooks (e.g., `should_process`, `read_document`, `chunk_document`, `embed_chunks`, `upsert_embeddings`, `on_failure`) to keep `run()` readable.
- Keep each hook small/testable; align with retry/dead-letter handling.

**APIs/CLIs & observability**
- Provide endpoints/commands for: manual reindex trigger, metrics readout, and viewing dead-letter entries.
- Structured logging around enqueue/dequeue, retries, and backfill progress; align with error-handling standard.

**Naming & module boundaries (per naming standard)**
- Suggested classes: `VaultWatcher` (watch events), `IndexingQueue` (enqueue/dedupe), `IndexingWorker` (process tasks), `IndexingPipeline` (Template Method), `EmbeddingStrategy` + `BGEEmbedder`/`OpenAIEmbedder`, `EmbeddingProviderFactory`, `DeadLetterRepository`, `MetricsService`.
- Group by responsibility: watcher module, queue/worker module, embedding module (strategy+factory), pipeline module, API/CLI surface.

## Visual Design
No mockups provided; a simple Tailwind + shadcn/ui list dashboard can show queued/failed counts, last processed timestamp, and a manual reindex action.

## Existing Code to Leverage
No existing components identified in the repo; follow project standards for naming, error handling, and validation.

## Out of Scope
- Per-file embedding provider overrides.
- Infinite retries or advanced backoff tuning.
- High-fidelity UI/visual polish beyond a basic metrics list.
- Expanded observability (latency histograms, per-model usage) beyond minimal metrics.
- Indexing binary/large asset directories or non-`.md` content.
