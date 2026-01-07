# Specification: PARA Project Folder Recognition

## Goal
To allow users to define a "Project Root" directory (e.g., "Projects") in their Obsidian Vault, automatically recognize immediate subfolders as PARAgon projects, and display them in a dashboard with metadata and manual progress tracking.

## User Stories
- As a **Project-Centric User**, I want to **configure my specific 'Projects' folder path** so that the system knows exactly where to look for my projects regardless of my vault structure.
- As a **Productivity Enthusiast**, I want to **see a list of all my active projects** with their file counts and last modified dates so that I can quickly identify which projects are active or neglected.
- As a **User**, I want to **manually update the progress percentage** of each project in the UI so that I can track my completion status alongside the automated metadata.

## Specific Requirements

**Project Root Configuration**
- Users must be able to input a relative path (e.g., "Projects" or "2. Projects") from the Vault root.
- The system must validate this path exists within the currently connected vault.

**Project Recognition Logic**
- The system must treat **immediate subdirectories** of the Project Root as individual Projects.
- Files residing directly in the Project Root must be ignored.
- System folders (starting with `.`) and hidden folders (e.g., `.obsidian`, `.trash`, `.DS_Store`) must be excluded.
- **Non-recurisve**: Only the first level of folders under the root are "Projects". Sub-folders within projects are just content.

**Project Metadata Calculation**
- **Project Name**: The name of the folder.
- **Note Count**: Total number of `.md` files within the project folder (recursive).
- **Last Modified**: The most recent `mtime` among all `.md` files in the project. If empty, use folder `mtime`.

**Manual Progress Tracking**
- Each project must have a writable "Progress" field (0-100%).
- For PoC, this data can be persisted in a simple local JSON file (e.g., `agent-os-metadata.json`) or simpler sidecar mechanism if DB is not ready. *Refining to use simple sidecar JSON in the backend or extending the current Vault Scanner response to include a 'mock' writable field if persistence is too complex for this step, but requirements say "Manual input" is in scope, so basic persistence is required.* -> **Decision**: Implement a simple JSON-based persistence in the backend to store `{ project_path: progress_value }`.

**Backend API**
- New Endpoint: `GET /projects`
- Query Param: `root_path` (optional, or read from settings).
- Response: List of objects `{ name, path, file_count, last_modified, progress }`.
- New Endpoint: `PATCH /projects/{project_id}` (or similar) to update progress.

**Frontend UI**
- **Project List View**: A new page or section displaying projects.
- **Project Card/Item**: Component showing Name, File Count, Last Modified, and an input/slider for Progress.
- **Configuration Input**: A simple input field to set the 'Project Root Path' (defaulting to "Projects").

## Visual Design
No visual assets provided.
- Use a **Card-based layout** for projects to differentiate from the file tree.
- **Progress Bar**: Visual indicator for the manual progress percentage.
- **Status Color**: Maybe color-code last modified date (e.g., red if > 30 days old - *Optional enhancement based on roadmap item "Project Monitor" but good to prepare for*).

## Existing Code to Leverage

**Vault Scanner Logic**
- `backend/app/vault_scanner.py`: Reuse the `VaultScanner` class or `scan_vault` function. Extend it to support scanning a *specific subdirectory* only and non-recursive top-level folder listing.

**Frontend File Components**
- `frontend/src/components/FolderTree.jsx`: Reference how it recursively renders items. We need a flat list of "Projects" (folders), so it's simpler, but the icon/styling logic is reusable.
- `frontend/src/components/FileItem.jsx`: Reuse for consistent icon styling (folder icons).

**API Structure**
- `backend/app/main.py`: Follow existing FastAPI route definition patterns.

## Out of Scope
- Automatic parsing of `#tags` for project status.
- Nested projects (Sub-projects).
- Recognition of non-markdown files (images, PDFs) for counts/modified dates.
- Complex database setup for settings (use simple JSON file for now).
- detailed "Dashboard" with charts (just a list/grid for now).
