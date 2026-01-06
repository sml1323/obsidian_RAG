# Spec Requirements: Note Embedding Pipeline

## Initial Description
선택된 볼트의 노트를 청킹하고 ChromaDB에 벡터 임베딩으로 저장하는 백엔드 파이프라인 구축

## Requirements Discussion

### First Round Questions

**Q1:** Embedding Model
**Answer:** Use **BGE-M3 (Local)** or **text-embedding-3-small (OpenAI)** instead of `all-MiniLM-L6-v2`.
-   **Reason:** Need robust support for both **Korean and English**.
-   **Design:** Implement using **Strategy Pattern** to allow for model switching (starting with these two options).

**Q2:** Chunking Strategy
**Answer:** Use **RecursiveCharacterTextSplitter** with `chunk_size=1000`, `chunk_overlap=200` (default settings from notebook).
-   **Future:** Refactor later to allow configuration via `settings.yaml`.

**Q3:** Vector Store
**Answer:** **ChromaDB** with Persistent Client.
-   **Location:** Local folder (e.g., `storage/chroma_db`).

**Q4:** Pipeline Trigger
**Answer:** **Manual "Sync/Embed" Button** on Frontend (PoC phase).
-   **Reason:** User control and easier debugging during development.

### Existing Code to Reference
The user provided Jupyter notebooks which should be adapted into `src/embeddings/` and `src/pipeline/` structures.

**Similar Features Identified by User:**
-   `day2 (2).ipynb`, `day3.ipynb`, `day4.ipynb` (provided in `planning/visuals/`)
-   Logic for: Document Loading, Splitting, Embedding, Vector Store.

### Follow-up Questions
N/A (User answers were very detailed and covered the necessary scope).

## Visual Assets

### Files Provided:
-   `day2 (2).ipynb`: Comprehensive implementation of loading, splitting, and embedding using LangChain and Chroma.
-   `day3.ipynb`: Retrieval and Chat logic (relevant for future RAG task, but contextually useful here).
-   `day4.ipynb`: Evaluation logic (good reference for testing).

### Visual Insights:
-   These are **implementation references** rather than UI mockups.
-   They define the *logic flow* for the backend pipeline.

## Requirements Summary

### Functional Requirements
1.  **Vault Scanning & Text Extraction:** Read Markdown files from the connected Obsidian Vault.
2.  **Chunking:** Split text using `RecursiveCharacterTextSplitter` (1000/200).
3.  **Embedding Generation:**
    -   Support **BGE-M3** (Local) for KR/EN capability.
    -   Support **text-embedding-3-small** (cloud option).
    -   Use **Strategy Pattern** to switch between them.
4.  **Vector Storage:** Store embeddings in local **ChromaDB**.
5.  **Trigger:** API endpoint to start the process, triggered by a manual button.

### Reusability Opportunities
-   **LangChain Community:** Use existing Loaders and TextSplitters.
-   **Notebook Logic:** Direct adaptation of the Python code in `day2 (2).ipynb`.

### Scope Boundaries
**In Scope:**
-   Backend FastAPI endpoint to trigger embedding.
-   Implementation of the Embedding Strategy pattern.
-   ChromaDB persistence setup.
-   Basic error handling for the pipeline.

**Out of Scope:**
-   Advanced RAG Chat (next feature).
-   Automatic background syncing (future enhancement).
-   Complex configuration UI (settings file refactor is for later).

### Technical Considerations
-   **Framework:** FastAPI (Backend).
-   **Library:** LangChain (as used in notebooks).
-   **Pattern:** **Strategy Pattern** for Embeddings.
-   **Language Support:** Must handle Korean characters correctly (tokenizer/encoding).
