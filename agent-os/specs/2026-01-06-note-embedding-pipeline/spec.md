# Specification: Note Embedding Pipeline

## Goal
Establish a backend pipeline that reads Markdown files from a connected Obsidian vault, chunks the content, generates vector embeddings using a configurable strategy (Local BGE-M3 or Cloud OpenAI), and stores them in a local ChromaDB for future retrieval.

## User Stories
- As a user, I want to manually trigger a "Sync/Embed" process so that my latest notes are indexed for AI search.
- As a user, I want the system to support both local (private) and cloud (high-quality) embedding models so I can choose the best balance of privacy and performance.
- As a user, I want my Korean and English notes to be accurately processed so that search results are relevant regardless of language.

## Specific Requirements

**API Endpoint**
-   Create `POST /api/embeddings/sync` endpoint in `backend/app/main.py`.
-   Endpoint should accept optional configuration (e.g., model choice) or use defaults.
-   Return a Job ID or stream progress logs to the frontend (simplified to synchronous return for MVP if needed, but async preferred).

**Vault Reader Integration**
-   Reuse `backend/app/vault_scanner.py` logic to recursively list `.md` files.
-   Extract raw text content from each file.
-   Handle file encoding (UTF-8) robustly.

**Text Chunking**
-   Implement `RecursiveCharacterTextSplitter` using LangChain.
-   Default config: `chunk_size=1000`, `chunk_overlap=200`.
-   Process list of documents into list of chunks.

**Embedding Strategy Pattern**
-   Create an abstract base class `EmbeddingStrategy`.
-   Implement `LocalEmbeddingStrategy` using `HuggingFaceEmbeddings` with `BAAI/bge-m3`.
-   Implement `OpenAIEmbeddingStrategy` using `OpenAIEmbeddings` with `text-embedding-3-small`.
-   Select strategy based on configuration/env vars.

**Vector Store (ChromaDB)**
-   Initialize `Chroma` client with a persistent path (e.g., `./storage/chroma_db`).
-   function `upsert_documents` to add new chunks.
-   (Optional for MVP) Handle duplicates or clearing old embeddings before re-indexing.

**Pipeline Orchestrator**
-   Create a service class `EmbeddingPipeline` that ties above components together:
    1.  Scan Vault
    2.  Chunk Text
    3.  Generate Embeddings (via Strategy)
    4.  Store in Chroma

## Visual Design
N/A - Backend Feature. (Frontend will only have a "Sync" button, designed in a separate future task).

**`planning/visuals/day2 (2).ipynb`**
-   Reference for `RecursiveCharacterTextSplitter` usage.
-   Reference for `Chroma.from_documents` usage.
-   Reference for `HuggingFaceEmbeddings` initialization.

## Existing Code to Leverage

**`backend/app/vault_scanner.py`**
-   Reuse `get_vault_structure` or `list_markdown_files` logic to get file paths.
-   Avoid rewriting directory traversal logic if possible.

**`backend/app/main.py`**
-   Extend existing FastAPI app to add new routes.

## Out of Scope
-   Frontend UI for "Chat" (this is the next feature).
-   Automatic background watching/syncing of file changes.
-   Complex settings UI to change chunk size dynamically (hardcode defaults for now).
-   Multi-vault support (assume single active vault).
-   PDF or Image embedding (Markdown text only).
