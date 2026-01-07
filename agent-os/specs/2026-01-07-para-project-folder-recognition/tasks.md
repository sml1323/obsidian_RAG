# Task Breakdown: PARA Project Folder Recognition

## Overview
Total Tasks: 14

## Task List

### Backend Layer

#### Task Group 1: Vault Scanner Extension & API
**Dependencies:** None

- [x] 1.0 Complete Backend Logic & API
  - [x] 1.1 Write 2-8 focused tests for Project logic
  - [x] 1.2 Extend `VaultScanner` or create `ProjectScanner`
  - [x] 1.3 Implement Simple Persistence
  - [x] 1.4 Create API Endpoints
  - [x] 1.5 Ensure Backend tests pass

**Acceptance Criteria:**
- `GET /projects` returns list of immediate subfolders from configured root
- Metadata includes correctly calculated file counts and max `mtime`
- Progress updates are persisted to JSON and survive restart
- Integration with existing `vault_scanner.py` logic works without breaking existing features

### Frontend Components

#### Task Group 2: Project UI & Integration
**Dependencies:** Task Group 1

- [x] 2.0 Complete Frontend UI
  - [x] 2.1 Write 2-8 focused tests for Project UI
  - [x] 2.2 Create `ProjectCard` Component
    - Display Name, Note Count, Last Modified
    - Add Number Input/Slider for Progress
    - Handle change events
  - [x] 2.3 Create `ProjectList` Page/Container
    - Fetch data from `GET /projects`
    - Grid/List layout for cards
    - "Project Root" configuration input at top
  - [x] 2.4 Integrate API
    - Wire up "Save Progress" to `PATCH /projects`
    - Wire up "Refresh" or initial load
  - [x] 2.5 Ensure Frontend tests pass
    - Run focused tests from 2.1
    - Verify UI updates optimistically or after fetch

**Acceptance Criteria:**
- Projects are displayed in a grid/list
- Manual progress input updates the backend
- "Project Root" configuration allows changing the scanned directory
- UI handles empty states or invalid paths gracefully

### Testing & Verification

#### Task Group 3: Verification & Polish
**Dependencies:** Task Groups 1-2

- [x] 3.0 Verify Implementation
  - [x] 3.1 Run all tests
  - [x] 3.2 Add integration test for full flow
    - Create a temp vault structure
    - Configure root -> Scan -> displayed in UI
    - Update progress -> Persisted -> Reload -> Value retained
  - [x] 3.3 Run feature-specific tests
  - [x] 3.4 Manual UI Verification (via Walkthrough)
  - [x] 3.5 Create walkthrough.md with screenshots

**Acceptance Criteria:**
- End-to-end flow verified
- No regressions in existing Vault connection
- Manual progress is reliably saved/loaded

## Execution Order

Recommended implementation sequence:
1. Backend Layer (Task Group 1)
2. Frontend Components (Task Group 2)
3. Testing (Task Group 3)
