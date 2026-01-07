# Spec Requirements: Docker Compose Integration

## Initial Description
Docker Compose 통합 환경 (FastAPI 백엔드와 React 프론트엔드를 Docker Compose로 한 번에 실행 가능하도록 구성)

## Requirements Discussion

### First Round Questions

**Q1:** I assume this Docker Compose setup ideally targets a **local development environment** (with hot-reloading for both backend and frontend). Is that correct, or should it target a production-ready build?
**Answer:** 초기 단계에서는 **로컬 개발 환경(Local Development Environment)**을 타겟으로 합니다. 백엔드와 프론트엔드 모두 코드 수정 시 즉시 반영되는 Hot-reloading 기능이 포함되도록 구성해 주세요. 운영용(Production) 빌드는 나중에 Tauri 패키징 단계에서 고려하겠습니다.

**Q2:** For managing environment variables (API keys, etc.), should we use a single **root `.env` file** that populates both containers, or keep separate `.env` files in `backend/` and `frontend/`?
**Answer:** 관리가 간편하도록 프로젝트 루트에 단일 .env 파일을 두고, 여기서 백엔드와 프론트엔드에 필요한 모든 환경 변수(API 키, 경로 등)를 중앙 관리하는 방식을 선호합니다.

**Q3:** To persist ChromaDB data and user settings across container restarts, I plan to mount a host volume. Do you have a preferred location (e.g., `./data` in project root), or should I stick to a standard named volume?
**Answer:** ChromaDB 데이터와 사용자 설정을 쉽게 확인하고 백업할 수 있도록, 호스트 볼륨 마운트 방식을 사용합니다. 프로젝트 루트의 ./storage 또는 ./data 폴더를 볼트로 지정해 주세요.

**Q4:** Since **Ollama** runs locally on the host, I will configure the backend container to connect via `host.docker.internal`. Do you need the option to run Ollama itself within a container as part of this setup?
**Answer:** 현재로서는 호스트 OS에 설치된 Ollama를 그대로 사용하는 host.docker.internal 연결 방식을 기본으로 합니다. 다만, 나중에 완전히 독립된 컨테이너 환경이 필요할 수 있으므로 docker-compose.yml에 Ollama 서비스를 추가하되 기본적으로는 비활성화(주석 처리 등)된 상태로 옵션을 제공해 주면 좋겠습니다.

**Q5:** Do you have specific base image preferences (e.g., `python:3.11-slim`, `node:18-alpine`), or should I choose standard lightweight images?
**Answer:** 프로젝트를 가볍게 유지하기 위해 python:3.11-slim 및 node:20-slim (또는 alpine)과 같은 경량화된 표준 이미지를 사용해 주세요.

**Existing Code Reuse:**
**Q:** Are there any other projects or reference files (perhaps in a different branch or stash) that we should align with?
**Answer:** 현재 워크스페이스에 기존 Docker 관련 파일은 없습니다. 이번 단계에서 표준적인 구조로 새롭게 생성해 주세요.

**Visual Assets Request:**
**Q:** Do you have any architectural diagrams or specific configuration examples you'd like us to follow?
**Answer:** 별도의 다이어그램은 없습니다. 백엔드는 8000번 포트, 프론트엔드는 3000번 포트를 기본으로 사용하는 전형적인 Full-stack Docker Compose 구조로 설계해 주세요.

### Existing Code to Reference
No similar existing features identified for reference.

## Visual Assets

### Files Provided:
No visual assets provided. (Confirmed via bash check)

## Requirements Summary

### Functional Requirements
- **Local Development Environment**: Support hot-reloading for both backend (FastAPI) and frontend (React).
- **Unified Configuration**: Use a single `.env` file at the project root to manage environment variables for both services.
- **Data Persistence**: Use host volume mounting (e.g., `./storage` or `./data`) for ChromaDB data and user settings visibility.
- **Ollama Integration**: Connect to host's Ollama instance via `host.docker.internal`. Include a commented-out service definition for a containerized Ollama in `docker-compose.yml`.
- **Port Mapping**: Map Backend to 8000 and Frontend to 3000.

### Reusability Opportunities
- None identified; will create standard `Dockerfile`s and `docker-compose.yml`.

### Scope Boundaries
**In Scope:**
- Create `Dockerfile` for Backend (using `python:3.11-slim`).
- Create `Dockerfile` for Frontend (using `node:20-slim`).
- Create `docker-compose.yml` at project root.
- configure hot-reloading (volumes bindings/command overrides).

**Out of Scope:**
- Production build optimization (multi-stage builds for static assets).
- Tauri packaging/integration (reserved for a later task).

### Technical Considerations
- **Base Images**: `python:3.11-slim`, `node:20-slim`.
- **Network**: Backend needs access to host network (for Ollama) or use special DNS name `host.docker.internal`.
- **Volume**: Host bind mounts for code (for hot-reload) and data (for persistence).
