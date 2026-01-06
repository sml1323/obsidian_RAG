# Spec Requirements: Basic RAG Chat

## Initial Description
Implement Basic RAG Chat interface with Ollama integration.
임베딩된 노트를 기반으로 Ollama 로컬 모델과 대화할 수 있는 채팅 인터페이스 구현.

## Requirements Discussion

### First Round Questions

**Q1:** Model Support (모델 지원)
**Answer:** 네, 처음부터 Ollama(로컬)와 OpenAI/Gemini(클라우드)를 모두 지원하도록 개발하겠습니다. 이미 이전 단계에서 클라우드 연동 기초를 닦았으므로, 채팅에서도 사용자가 모델을 선택하여 대화할 수 있는 구조를 유지해 주세요.

**Q2:** Ollama Configuration (Ollama 설정)
**Answer:** 사용자에게 모델명을 직접 입력받거나 선택할 수 있게 하되, 기본값(Default)으로 **llama3.1 또는 mistral**을 설정해 주세요. 하드코딩보다는 추후 settings에서 변경 가능한 구조가 좋습니다.

**Q3:** Context Retrieval (컨텍스트 검색)
**Answer:** 네, ChromaDB에서 유사도가 높은 **상위 3~5개의 청크(Chunks)**를 추출하여 LLM에 전달하는 표준 방식으로 진행하겠습니다.

**Q4:** Chat History (채팅 기록)
**Answer:** MVP 단계에서는 **휘발성(Ephemeral, 세션 전용)**으로 구현합니다. 페이지를 새로고침하면 대화 기록이 지워져도 괜찮습니다. 채팅 기록 저장 기능은 나중에 SQLite 등을 활용해 고도화할 예정입니다.

**Q5:** UI Layout (UI 레이아웃)
**Answer:** 채팅 인터페이스는 별도의 'Chat Mode' 또는 탭으로 분리해 주세요. 사이드바의 트리 뷰는 유지하되, 중앙 메인 패널에서 '파일 보기'와 'AI 채팅'을 전환할 수 있는 구조를 선호합니다.

**Q6:** Existing Code Reuse (기존 코드 재사용)
**Answer:** 임베딩 설정에서 사용했던 ModelSelector 컴포넌트 로직을 확장하여 채팅 모델 선택에도 재사용해 주세요.

**Q7:** Visual Assets Request (시각 자료)
**Answer:** 현재 별도의 디자인 모컵은 없습니다. Antigravity의 기본 채팅 UI 구성 요소를 활용하여 전형적인 메신저 형태(하단 입력창, 중앙 메시지 리스트)로 깔끔하게 구성해 주세요.

### Existing Code to Reference

**Similar Features Identified:**
- Component: `ModelSelector`
- Functionality: Existing embedding pipeline model selection logic.

### Follow-up Questions
None.

## Visual Assets

### Files Provided:
No visual assets provided.

## Requirements Summary

### Functional Requirements
- **Dual Model Support**: Support both Local (Ollama) and Cloud (OpenAI) for chat generation.
- **Model Configuration**: User can input/select model name (default: `llama3.1` or `mistral` for Ollama).
- **RAG Pipeline**: Retrieve top 3-5 relevant chunks from ChromaDB based on user query.
- **Chat Interface**:
    - Ephemeral chat history (cleared on refresh).
    - Toggle between "File View" and "Chat Mode" in the main panel.
    - Standard chat UI: Message list (user/AI), input area, send button.
- **Settings**: Ability to configure model settings (likely reusing/extending `ModelSelector`).

### Reusability Opportunities
- Reuse `ModelSelector` logic for choosing the generation model.
- Reuse `VectorStoreManager` for retrieval.

### Scope Boundaries
**In Scope:**
- RAG Chat Interface (React).
- RAG Backend Endpoint (FastAPI) handling retrieval + generation.
- Integration with Ollama and OpenAI API.

**Out of Scope:**
- Persisting chat history (Database/LocalStorage).
- Multi-session management.
- Complex prompt engineering (use standard RAG prompt).

### Technical Considerations
- **Backend**: New endpoint `POST /api/chat`. Needs to handle streaming response if possible (or simple request/response for MVP).
- **Frontend**: State management for chat messages `[{role: 'user', content: '...'}, {role: 'assistant', content: '...'}]`.
