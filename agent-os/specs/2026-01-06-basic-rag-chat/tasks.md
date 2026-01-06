# Task Breakdown: Basic RAG Chat

## Overview
Total Tasks: 2 Groups

## Task List

### Backend Layer

#### Task Group 1: Chat API & RAG Logic
**Dependencies:** None

- [x] 1.0 Complete Backend Chat API
  - [x] 1.1 Write 2-8 focused tests for Chat API
    - [x] Test `POST /api/chat` endpoint structure
    - [x] Test model switching logic (mocked)
    - [x] Test error handling when no vault connected
  - [x] 1.2 Implement `ChatRequest` and `ChatResponse` models
    - [x] `ChatRequest`: message, model_config (type, model_name, api_key)
    - [x] `ChatResponse`: role, content
  - [x] 1.3 Implement `ChatEngine` or extend `EmbeddingPipeline`
    - [x] reused `VectorStoreManager` for retrieval (`embed_query` + search)
    - [x] Construct prompt with context
    - [x] Call LLM (Ollama or OpenAI)
  - [x] 1.4 Create `POST /api/chat` endpoint
    - [x] Connect `ChatEngine` to endpoint
    - [x] Handle empty context case (graceful fallback)
  - [x] 1.5 Ensure Backend tests pass
    - [x] Run the tests from 1.1

**Acceptance Criteria:**
- `POST /api/chat` accepts user query and model config.
- Returns AI response based on retrieved context.
- Supports both "local" and "openai" model types.

### Frontend Components

#### Task Group 2: Chat Interface
**Dependencies:** Task Group 1

- [x] 2.0 Complete Chat UI
  - [x] 2.1 Write 2-8 focused tests for Chat UI
    - [x] Test "Chat Mode" toggle interaction
    - [x] Test message sending and display
    - [x] Test model selection state passing
  - [x] 2.2 Add "Chat Mode" state to `App.jsx`
    - [x] State `viewMode`: 'files' | 'chat'
    - [x] Toggle button in Sidebar or Header
  - [x] 2.3 Create `ChatInterface` component
    - [x] Message List (User/AI bubbles)
    - [x] Input area
    - [x] Markdown rendering for AI responses
  - [x] 2.4 Integrate `ModelSelector` with Chat
    - [x] Allow selecting chat model (reuse/adapt `ModelSelector` if needed or pass props)
  - [x] 2.5 Connect to Backend API
    - [x] `handleSend` triggers `POST /api/chat`
    - [x] Display loading state while generating
  - [x] 2.6 Ensure Frontend tests pass
    - [x] Run tests from 2.1

**Acceptance Criteria:**
- User can toggle between File Tree and Chat Interface.
- Messages are displayed correctly.
- User can select model and chat with notes.
- Ephemeral history works (clears on refresh).

## Execution Order
1. Backend Layer (Task Group 1)
2. Frontend Components (Task Group 2)
