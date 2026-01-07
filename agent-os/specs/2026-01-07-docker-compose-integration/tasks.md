# Task Breakdown: Docker Compose Integration

## Overview
Total Tasks: 4 Groups

## Task List

### Backend Infrastructure

#### Task Group 1: Backend Containerization
**Dependencies:** None

- [/] 1.0 Dockerize Backend
  - [x] 1.1 Create Backend Dockerfile
    - Base: `python:3.11-slim`
    - Install `curl` for healthchecks if needed
    - Copy requirements and install dependencies
    - Set working directory to `/app`
  - [x] 1.2 Configure Backend Entrypoint
    - Command: `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
  - [x] 1.3 Verify Backend Build
    - Run `docker build -t backend-test ./backend`
    - Ensure build completes without errors

**Acceptance Criteria:**
- Backend image builds successfully
- Python environment is correctly set up in the image

### Frontend Infrastructure

#### Task Group 2: Frontend Containerization
**Dependencies:** None

- [ ] 2.0 Dockerize Frontend
  - [x] 2.1 Create Frontend Dockerfile
    - Base: `node:20-slim`
    - Set working directory to `/app`
    - Copy package.json and install dependencies
    - Expose port 3000
  - [x] 2.2 Configure Frontend Entrypoint
    - Command: `npm run dev -- --host`
  - [x] 2.3 Verify Frontend Build
    - Run `docker build -t frontend-test ./frontend`
    - Ensure build completes without errors

**Acceptance Criteria:**
- Frontend image builds successfully
- Node environment is correctly set up in the image

### Orchestration

#### Task Group 3: Docker Compose Setup
**Dependencies:** Task Group 1, Task Group 2

- [x] 3.0 Orchestrate Services
  - [x] 3.1 Create `.env` file from template
    - Centralize config for both services
  - [x] 3.2 Create `docker-compose.yml`
    - Define `backend` service (Port 8000:8000)
    - Define `frontend` service (Port 3000:3000)
    - Configure volume mounts for hot-reloading (`./backend:/app`, `./frontend:/app`)
    - Configure data volume for ChromaDB (`./storage:/app/storage`)
    - Set up `host.docker.internal` for Ollama access
  - [x] 3.3 Add optional Ollama service
    - Add commented-out Ollama service definition for future use

**Acceptance Criteria:**
- `docker-compose.yml` is valid
- Services are correctly linked and configured
- Volumes are mapped correctly

### Verification

#### Task Group 4: Integrated Testing
**Dependencies:** Task Group 3

- [x] 4.0 Verify Integrated Environment
  - [x] 4.1 Verify Startup
    - Run `docker-compose up -d`
    - Check logs for successful startup of both containers
  - [x] 4.2 Verify Connectivity
    - Backend: `curl http://localhost:8000/docs` returns 200
    - Frontend: `curl http://localhost:3000` returns 200/HTML
  - [x] 4.3 Verify Hot-Reloading
    - Change a backend file -> Verify reload in logs
    - Change a frontend file -> Verify reload in logs
  - [x] 4.4 Verify Persistence
    - Check if `./storage` (or configured data dir) contains data after usage
  - [x] 4.5 Verify Ollama Access
    - Trigger a chat request from backend (requiring Ollama) -> Verify success

**Acceptance Criteria:**
- Full stack comes up with one command
- Hot-reloading works for both services
- Data persists across restarts
- Backend effectively communicates with host Ollama
