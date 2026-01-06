# Task Breakdown: Note Embedding Pipeline

## Overview
Total Tasks: 22

## Task List

### Backend Layer

#### Task Group 1: Embedding Engine & Storage
**Dependencies:** None

- [x] 1.0 Implement Core Embedding Engine
  - [x] 1.1 Write 2-8 focused tests for EmbeddingStrategy and ChromaDB
    - Test `EmbeddingStrategy` factory/selection logic
    - Test `ChromaDB` client initialization and basic upsert (mocked if needed)
  - [x] 1.2 Implement `EmbeddingStrategy` Pattern
    - Abstract Base Class `EmbeddingStrategy`
    - `LocalEmbeddingStrategy` (using `HuggingFaceEmbeddings` / `BAAI/bge-m3`)
    - `OpenAIEmbeddingStrategy` (using `OpenAIEmbeddings` / `text-embedding-3-small`)
  - [x] 1.3 Implement `VectorStoreManager`
    - Wrapper around `Chroma` client with persistent path
    - Method `upsert_documents(chunks)`
  - [x] 1.4 Ensure Engine tests pass
    - Run ONLY the tests from 1.1

**Acceptance Criteria:**
- Strategies can correspond to configuration (Local vs OpenAI)
- ChromaDB client initializes correctly in local storage
- Tests pass

#### Task Group 2: Content Processing Pipeline
**Dependencies:** Task Group 1

- [x] 2.0 Implement Processing Pipeline
  - [x] 2.1 Write 2-8 focused tests for Pipeline logic
    - Test chunking logic with sample text
    - Test pipeline orchestration (scan -> chunk -> embed -> store)
  - [x] 2.2 Implement Text Chunking
    - Use `RecursiveCharacterTextSplitter` (chunk_size=1000, overlap=200)
    - Helper function to split list of text content
  - [x] 2.3 Implement `EmbeddingPipeline` Service
    - Integrate `VaultScanner` (reuse existing) to get files
    - Orchestrate: Read File -> Extract Text -> Split -> Get Embeddings -> Store
    - Handle encoding errors gracefully
  - [x] 2.4 Ensure Pipeline tests pass
    - Run ONLY the tests from 2.1

**Acceptance Criteria:**
- Pipeline successfully processes a robust sample markdown file
- Chunks are created with correct size
- Data flows from scanner to vector store

### API Layer

#### Task Group 3: API Endpoints
**Dependencies:** Task Group 2

- [x] 3.0 Implement Sync Endpoint
  - [x] 3.1 Write 2-8 focused tests for Sync Endpoint
    - Test `POST /api/embeddings/sync` success case
    - Test error handling (e.g., vault not ready)
  - [x] 3.2 Create API Route
    - POST `/api/embeddings/sync`
    - Accept optional `model_type` param (default to config)
    - Trigger `EmbeddingPipeline`
    - Return success message / job status
  - [x] 3.3 Ensure API tests pass
    - Run ONLY the tests from 3.1

**Acceptance Criteria:**
- Endpoint is accessible via Swagger UI
- Triggering endpoint runs the pipeline
- Returns 200 OK on success

### Frontend Layer

#### Task Group 4: Trigger UI
**Dependencies:** Task Group 3

- [x] 4.0 Implement Sync Button
  - [x] 4.1 Write 2-8 focused tests for Sync Button
    - Test button click fires API call
    - Test loading state display
  - [x] 4.2 Add "Sync Embeddings" Button
    - Place in Sidebar or Settings area
    - Simple UI: Button + Status Indicator (Idle, Syncing, Done)
  - [x] 4.3 Connect to Backend API
    - wiring to `POST /api/embeddings/sync`
  - [x] 4.4 Ensure Frontend tests pass
    - Run ONLY the tests from 4.1

**Acceptance Criteria:**
- User can click button to start embedding
- UI shows feedback (loading/success)

### Verification

#### Task Group 5: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-4

- [x] 5.0 Review and Gap Analysis
  - [x] 5.1 Review all tests from Groups 1-4
  - [x] 5.2 Identify critical coverage gaps for full workflow
  - [x] 5.3 Write max 5 additional integration tests
    - End-to-end test: Trigger API -> Verify ChromaDB has data
  - [x] 5.4 Run Feature Validation
    - Verify with actual Obsidian vault files (Korean & English)

**Acceptance Criteria:**
- Full feature works end-to-end
- Korean and English notes are searchable (via inspection of DB or logs)
