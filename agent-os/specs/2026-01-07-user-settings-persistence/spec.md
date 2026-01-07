# Specification: Settings and User Environment Persistence

## Goal
Implement a local persistence layer for user settings (Vault Path, AI Model, API Keys) and project metadata to ensure a continuous experience across sessions and enable offline-ready capabilities for the future Tauri app.

## User Stories
- As a user, I want my Vault connection and API keys to remain saved after I restart the app so that I don't have to re-enter them every time.
- As a user, I want to see my project completion rates preserved between sessions so that I can track long-term progress.
- As a user, I want to easily modify my settings via a settings menu without leaving the current view.

## Specific Requirements

**Backend Storage Layer**
- Create a `storage/` directory in the backend root (ensure it is gitignored).
- Implement `storage/settings.json` to store:
    - `vault_path`: string
    - `model_type`: string ("local" | "openai" | "gemini")
    - `api_keys`: object { "openai": "...", "gemini": "..." }
- Implement `storage/projects.json` to store:
    - Key-value pairs of `project_path` -> `progress` (int).
- Ensure atomic usage of file writes where possible to prevent corruption.

**Settings API**
- `GET /api/settings`: Retrieve current system settings.
- `PATCH /api/settings`: Update system settings (partial updates allowed).
- `GET /api/projects`: Return project list with merged progress data from `projects.json`.
- `PATCH /api/projects`: Update progress for a specific project.

**Frontend Settings Modal**
- Create a reusable `Modal` component using Tailwind CSS (backdrop filter, centered card).
- Create a `SettingsModal` component that uses `Modal`.
- Add a "Gear" icon button to the main navigation (top right).
- Fields in Modal:
    - **Vault Path**: Input field (read-only or editable, connected to connect API).
    - **AI Model**: Dropdown (Ollama / OpenAI / Gemini).
    - **API Keys**: Conditional Input fields based on selected model (masked output).

**State Initialization**
- On `App` mount, fetch `GET /api/settings`.
- If a Vault Path is saved, automatically attempt to reconnect to that vault (verify it still exists).
- Initialize global state (Context/Redux) with saved Model and API keys.

## Visual Design
*No specific mockups provided.*
- Use existing "Glassmorphism" aesthetic.
- **Modal**: Dark semi-transparent backdrop (`bg-black/50 backdrop-blur-sm`), centered container with `bg-gray-800` and thin border.
- **Inputs**: Standard rounded inputs with `bg-gray-700` and `focus:ring` styles matching `VaultConnector`.

## Existing Code to Leverage

**`backend/app/vault_scanner.py` & `main.py`**
- Reuse `pathlib` and `json` patterns for file I/O.
- Extend `VaultConnectRequest` logic to update global settings on successful connect.

**`frontend/src/components/VaultConnector.jsx`**
- Reuse the input styling and connection logic.
- Extract the "Connect" logic to be usable from the Settings Modal if needed.

## Out of Scope
- Cloud synchronization of settings (e.g. Firebase, S3).
- complex encryption for API keys (stored as plain text for now).
- Multi-profile support (single user only).
- Theme customization (Dark mode only).
