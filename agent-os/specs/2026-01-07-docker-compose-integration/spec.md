# Specification: Docker Compose Integration

## Goal
Establish a unified local development environment using Docker Compose that orchestrates both the FastAPI backend and React frontend with hot-reloading, data persistence, and centralized configuration, simplifying the developer workflow.

## User Stories
- As a developer, I want to start the entire stack (backend + frontend) with a single command so that I can focus on coding rather than environment setup.
- As a developer, I want code changes to reflect immediately in the running containers so that I can maintain a fast feedback loop without rebuilding.
- As a developer, I want to manage all environment variables in one place so that configuration is consistent and easy to change.

## Specific Requirements

**Docker Compose Configuration**
- Create `docker-compose.yml` in project root orchestrating `backend` and `frontend` services.
- Map Backend port to 8000 and Frontend port to 3000 on the host.
- Mount `./backend` and `./frontend` directories to containers to enable hot-reloading.
- Use a single `.env` file at the project root to inject environment variables into both containers.

**Backend Containerization**
- Create `backend/Dockerfile` using `python:3.11-slim` as base.
- Install dependencies from `requirements.txt`.
- Configure entrypoint to run uvicorn with `--reload` for development.
- Ensure connectivity to host's Ollama instance (likely via `host.docker.internal`).

**Frontend Containerization**
- Create `frontend/Dockerfile` using `node:20-slim` as base.
- Install dependencies via `npm install`.
- Configure entrypoint to run `npm run dev` (Vite dev server) with host exposure (`--host`).

**Data Persistence**
- Mount a host volume (e.g., `./storage` or `./data`) to the backend container to persist ChromaDB data and user settings.
- Ensure specific paths in backend code utilize this mounted volume path.

**Ollama Integration**
- Configure backend service to access Ollama on the host machine.
- Include a commented-out service definition for a separate Ollama container in `docker-compose.yml` for future use.

## Visual Design
No visual assets provided.

## Existing Code to Leverage
No existing Docker-related code found in the project. Standard implementation will be used.

## Out of Scope
- Production build optimizations (multi-stage builds, nginx serving static files).
- Tauri application packaging and bundling.
- Kubernetes or remote deployment configurations.
