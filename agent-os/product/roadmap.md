# Product Roadmap

1. [ ] Vault Indexer & Incremental Embeddings — Index Obsidian vault into Chroma with a watcher that performs incremental embeddings on file change/create/delete, including backfill job and basic health metrics for the queue. `[M]`
2. [ ] Grounded RAG Chat API — Expose FastAPI endpoint that retrieves from Chroma, applies source-aware prompts, and returns citations; includes provider switch for BGE-M3 vs OpenAI 3-small and Ollama vs GPT/Gemini. `[M]`
3. [ ] Chat UI in Obsidian Companion — React + Tailwind panel to ask questions, stream responses, and show source snippets with jump-to-note links; uses the RAG API and handles errors gracefully. `[S]`
4. [ ] PARA Structure Ingestion — Scan Project/ areas to map folders to projects, store last-modified timestamps per file, and accept user-supplied progress % with validation; scheduled refresh to keep data current. `[M]`
5. [ ] PARA Project Dashboard — Dashboard that surfaces project health (progress %, last updated, staleness flags), filters by status, and highlights neglected projects; powered by the PARA ingestion data. `[S]`
6. [ ] Spaced Repetition Scheduler — Tag-based selection (#review) that computes due items from the forgetting-curve schedule, supports randomization, and exposes an API to fetch the next review set. `[S]`
7. [ ] Review Session UI — Lightweight review flow that presents due notes/cards, logs outcomes (pass/struggle), and updates next-review dates; integrates with the scheduler API. `[S]`
8. [ ] Background Orchestration & Safeguards — Job runner for indexing/refresh/review scheduling with backoff on failures, audit logs for data updates, and configuration surface for provider keys and rate limits. `[M]`

> Notes
> - Order items by technical dependencies and product architecture
> - Each item should represent an end-to-end (frontend + backend) functional and testable feature
