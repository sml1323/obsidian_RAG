# Tech Stack

## Backend

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Python (FastAPI) | REST API 서버, 비동기 처리 |
| **Vector Database** | ChromaDB | 노트 임베딩 저장 및 유사도 검색 |
| **RAG Framework** | LangChain / LlamaIndex | 문서 청킹, 임베딩, 검색 파이프라인 |

## Frontend

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | React (Google Antigravity 기반) | SPA UI 구축 |
| **Styling** | Tailwind CSS | 유틸리티 기반 CSS 스타일링 |

## AI Models

| Category | Technology | Purpose |
|----------|------------|---------|
| **Local** | Ollama | 로컬 LLM 추론 (프라이버시 유지) |
| **Cloud** | OpenAI API | GPT 모델 기반 RAG 채팅 |
| **Cloud** | Google Gemini API | Gemini 모델 기반 RAG 채팅 |

## Infrastructure

| Category | Technology | Purpose |
|----------|------------|---------|
| **Containerization** | Docker | 애플리케이션 컨테이너화 |
| **Orchestration** | Docker Compose | FastAPI + React 통합 실행 환경 |

## Platform & Deployment

| Category | Technology | Purpose |
|----------|------------|---------|
| **Initial** | Web PoC | 브라우저 기반 프로토타입 |
| **Final** | Tauri | macOS 네이티브 앱 패키징 |

## Development Workflow

- **Package Manager**: npm (Frontend), pip/poetry (Backend)
- **Version Control**: Git
- **Development Environment**: Docker Compose (로컬 개발 통합)
