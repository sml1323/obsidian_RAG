# Specification: Basic RAG Chat

## Goal
Implement a chat interface that allows users to query their notes using a RAG (Retrieval-Augmented Generation) pipeline, supporting both local (Ollama) and cloud (OpenAI) models.

## User Stories
- As a user, I want to switch between "File View" and "Chat Mode" so I can focus on reading or asking questions.
- As a user, I want to choose between Ollama and OpenAI models to balance privacy and performance.
- As a user, I want the AI to answer my questions based on my notes (retrieved from vector store) so I can find information quickly.

## Specific Requirements

**Dual Model Support**
- Support switching between "Local (Ollama)" and "Cloud (OpenAI)" for generation.
- Reuse `ModelSelector` logic (extended for chat models) to allow users to configure the active model.
- For Ollama, allow specifying the model name (default: `llama3.1` or `mistral`).
- For OpenAI, reuse the API key handling mechanism.

**RAG Pipeline**
- Implement `POST /api/chat` endpoint in FastAPI.
- Use `VectorStoreManager` to retrieve top 3-5 relevant chunks for the user query.
- Construct a prompt combining the user query and retrieved context.
- Send prompt to the selected LLM (Ollama or OpenAI) and return the response.

**Chat Interface (UI)**
- Create a "Chat Mode" toggle or tab in the main content area (replacing File View when active).
- Implement a standard chat layout:
    - Message list area (scrollable).
    - Input area with "Send" button.
- Display messages with clear distinction between "User" and "AI".
- Support markdown rendering for AI responses (since notes are markdown).

**Ephemeral History**
- Chat history exists only in the frontend state (session-based).
- Refreshing the page clears the conversation.
- No persistent storage for chat logs in MVP.

**Context-Aware Generation**
- The system MUST search the vector database using the user's query *before* generating an answer.
- If no relevant context is found, the AI should state that it couldn't find information in the notes.

## Visual Design
No mockups provided. Use standard "Messenger" style layout:
- **Main Area**: Vertical list of bubbles/blocks. User right/gray, AI left/transparent or colored.
- **Footer**: Textarea for input, growing with content, plus a primary action button (Send).

## Existing Code to Leverage

**`frontend/src/components/ModelSelector.jsx`**
- Reuse this component's UI and state logic for selecting between Local/OpenAI.
- May need to be refactored to support "embedding model" vs "chat model" selection, or just duplicate/adapt for chat settings.

**`backend/app/embedding_engine.py` / `VectorStoreManager`**
- Reuse `VectorStoreManager` to access the existing `Chroma` instance.
- Use `embed_query` functionality to convert the chat query into a vector for retrieval.

**`backend/app/main.py`**
- Follow existing patterns for API endpoints (`/api/vault/...`).
- Reuse `get_pipeline` or similar factory logic to instantiate the LLM client.

## Out of Scope
- **Chat History Persistence**: Saving chats to a database or file.
- **Multi-turn Context**: The MVP treats each message as a standalone query (or simple history appending), no complex memory management.
- **Streaming Responses**: For MVP simplicity, simple request/response is acceptable if streaming adds too much complexity (though streaming is preferred if easy).
- **Advanced Prompt Engineering**: No complex chain-of-thought or agentic behaviors.
