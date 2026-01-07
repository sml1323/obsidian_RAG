# Task Breakdown: Settings and User Environment Persistence

## Overview
Total Tasks: 13

## Task List

### Backend Layer

#### Task Group 1: Storage & API
**Dependencies:** None

- [x] 1.0 Implement Backend Storage & API
  - [x] 1.1 Write 2-4 focused tests for `SettingsService`
    - Test generic JSON read/write operations
    - Test handling of missing files (defaults)
    - Test atomic write logic (avoid corruption)
  - [x] 1.2 Implement `SettingsService` in `backend/app/settings.py`
    - `load_settings()`, `save_settings()` for `settings.json`
    - `load_projects()` (merged with `project_metadata.json`), `save_project_progress()`
    - Ensure `storage/` directory creation
  - [x] 1.3 Write 2-4 focused tests for Settings & Project API endpoints
    - Test `GET /api/settings` returns defaults/saved values
    - Test `PATCH /api/settings` updates values
    - Test `GET /api/projects` integrates progress data
    - Test `PATCH /api/projects` updates specific project
  - [x] 1.4 Implement API endpoints in `backend/app/main.py`
    - `GET /api/settings`
    - `PATCH /api/settings`
    - Update `GET /api/projects` to use `SettingsService` (refactor from `vault_scanner.py` or integrate)
    - Update `PATCH /api/projects` to use `SettingsService`
  - [x] 1.5 Ensure backend tests pass
    - Run the focused tests from 1.1 and 1.3

**Acceptance Criteria:**
- Settings are persisted to `storage/settings.json`
- Project progress is persisted to `storage/projects.json`
- Endpoints correctly read/write to these files
- API keys can be saved and retrieved (plain text for MVP)

### Frontend Components

####- [x] Implement Task Group 2: Settings UI <!-- id: 17 -->
**Dependencies:** Task Group 1

  - [x] 2.0 Implement Frontend Settings UI
  - [x] 2.1 Write 2-4 focused tests for `SettingsModal`
    - Test opening/closing via Gear icon
    - Test form field rendering (Vault Path, Model, Keys)
    - Test conditional rendering of API Key inputs based on Model selection
  - [x] 2.2 Create `Modal` reusable component
    - Backdrop, centered content, close button/click-outside
    - Glassmorphism style
  - [x] 2.3 Create `SettingsModal` component
    - Connect to `GET /api/settings` on mount
    - Form state management
    - Save handler calling `PATCH /api/settings`
  - [x] 2.4 Integrate Gear Icon into `App.jsx` or Navigation
    - Top-right positioning
    - Click opens `SettingsModal`
  - [x] 2.5 Implement App Initialization Logic
    - On App mount, fetch settings
    - If `vault_path` exists, auto-trigger "Connect"
    - Restore Model selection
  - [x] 2.6 Ensure frontend tests pass
    - Run the focused tests from 2.1

**Acceptance Criteria:**
- Gear icon opens Settings Modal
- Settings can be viewed and edited
- Changes are persisted to backend
- App restores state (Vault connection, Model selection) on refresh

### Verification

####- [x] Implement Task Group 3: Final Verification <!-- id: 18 -->
**Dependencies:** Task Group 2

  - [x] 3.0 Verify Implementation
  - [x] 3.1 Perform manual verification
    - [x] Restart Backend & Frontend -> Verify persistence
    - [x] Change Settings -> Refresh -> Verify changes stick
    - [x] Connect new Vault -> Restart -> Verify Vault still connected
    - [x] Update Project Progress -> Restart -> Verify Progress preserved
  - [x] 3.2 Fix any bugs found during verification

**Acceptance Criteria:**
- User environment persists across full app restarts
- Settings UI works intuitively
