# Walkthrough: Basic RAG Chat

I have implemented the **Basic RAG Chat** feature, allowing users to chat with their Obsidian notes using local (Ollama) or cloud (OpenAI) models.

## Changes

### Backend
- **New Endpoint**: `POST /api/chat` in `main.py`.
- **Logic**: `ChatEngine` in `chat_engine.py` orchestrates retrieval (VectorStore) and generation (LLM).
- **Models**: Updated `ChatRequest` to include `config` for flexible model selection.
- **Dependencies**: Added `langchain-community` for Ollama support.

### Frontend
- **Chat Mode**: Added a toggle in the Header to switch between "Files" and "Chat Mode".
- **Chat Interface**: Created `ChatInterface.jsx` for message history and input.
- **Model Selector**: Refactored `ModelSelector.jsx` to support both "Embedding" (sync) and "Chat" (generation) modes with model naming.
- **Sidebar**: Context-aware sidebar shows Embedding controls in File mode and Chat controls in Chat mode.

## Verification

### Automated Tests
I have added and verified the following tests:

**Backend Tests (`backend/tests/test_chat_api.py`)** -> **PASSED**
- `test_chat_endpoint_structure`: Verifies API response format.
- `test_chat_model_switching`: Checks if configuration is passed correctly.
- `test_chat_endpoint_no_vault`: Ensures valid error when no vault is connected.

**Frontend Tests (`frontend/src/__tests__/ChatIntegration.test.jsx`)** -> **PASSED**
- `toggles between file view and chat mode`: Verifies UI switching.
- `sends message and displays response`: Mocks API call and verifies message flow.

### Manual Verification Steps
1.  **Connect Vault**: Provide a valid path.
2.  **Sync Embeddings**: Use the "Embedding Model" selector (Local or OpenAI) and click "Sync Embeddings".
3.  **Switch to Chat**: Click "Chat Mode" in the top right.
4.  **Configure Chat**: 
    - Select "Local (Ollama)" and enter "llama3.1".
    - Or Select "OpenAI" and enter API Key.
5.  **Ask Question**: Type a question about your notes.
6.  **Verify**: The answer should be based on your notes (RAG).

## Visuals
(No screenshots available in this environment, but UI structure follows the spec.)

## Next Steps
- Implement chat history persistence (Database).
- Add streaming responses for better UX.
- Improve prompt engineering for better context utilization.
