# Product Tech Stack

- **Backend:** Python 3 + FastAPI; LangChain for retrieval/LLM orchestration; ChromaDB as vector store with incremental indexing.
- **Embeddings:** Primary BGE-M3 (open source); optional OpenAI `text-embedding-3-small`.
- **LLM Providers:** Local Ollama models; optional GPT/Gemini APIs behind a provider-switchable interface.
- **Frontend:** React + Tailwind CSS with shadcn/ui components for Obsidian companion surfaces (chat, dashboards, review UI).
- **Data & Storage:** Obsidian vault as source of truth; ChromaDB for vectors; lightweight metadata store for PARA/project stats and review scheduling (file-based or simple DB as needed).
- **Deployment & Runtime:** Dockerized services; env var–driven config for keys, models, and rates.
- **Testing & Quality:** Pytest for backend; React Testing Library for UI; lint/format with Ruff + Black (Python) and ESLint + Prettier (JS/TS).
- **Observability & Ops:** Basic request/queue metrics and structured logging; health endpoints for indexer and API.
- **Architecture & Patterns (Learning Goal):** Emphasize Strategy/Template Method/Factory patterns in provider selection, embedding pipelines, and scheduling flows.
