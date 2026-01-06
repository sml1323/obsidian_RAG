# Task Breakdown: Obsidian Vault 연결

## Overview
Total Tasks: 4 Task Groups, 18 Sub-tasks

## Task List

### Backend Layer

#### Task Group 1: Vault Scanning API
**Dependencies:** None

- [x] 1.0 Complete backend vault scanning API
  - [x] 1.1 Write 4-6 focused tests for vault scanning functionality
    - Test valid vault path connection
    - Test invalid/non-existent path error handling
    - Test recursive markdown file discovery
    - Test exclusion of `.obsidian/`, `.trash/`, `node_modules/` folders
    - Test file metadata extraction (filename, path, modified time)
  - [x] 1.2 Create vault scanning module
    - Implement recursive directory traversal for `.md` files
    - Define EXCLUDED_FOLDERS constant: `[".obsidian", ".trash", "node_modules"]`
    - Extract metadata: filename, relative path, last modified (ISO 8601)
    - Build hierarchical JSON tree structure
  - [x] 1.3 Create FastAPI endpoints
    - `POST /api/vault/connect`: Receive and validate vault path
    - `GET /api/vault/files`: Return file tree with metadata
    - Store connected vault path in session/memory
  - [x] 1.4 Implement error handling
    - Path not found error response
    - Permission denied error response
    - Empty vault handling
  - [x] 1.5 Ensure backend tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify API responses match expected JSON structure

**Acceptance Criteria:**
- All 4-6 backend tests pass ✅ (11 tests passed)
- API correctly scans vault and returns tree structure ✅
- Excluded folders are properly filtered ✅
- Proper error messages for invalid paths ✅

---

### Frontend Components

#### Task Group 2: Vault Connection UI
**Dependencies:** Task Group 1

- [x] 2.0 Complete vault connection UI
  - [x] 2.1 Write 2-4 focused tests for connection UI
    - Test path input and submit
    - Test success/failure state display
    - Test API integration
  - [x] 2.2 Create VaultConnector component
    - Text input field for absolute path
    - "연결" (Connect) button
    - Success indicator: green checkmark
    - Error indicator: red error message
  - [x] 2.3 Implement API integration
    - Call `POST /api/vault/connect` on submit
    - Handle loading state during connection
    - Store connection state in app context
  - [x] 2.4 Ensure connection UI tests pass
    - Run ONLY the 2-4 tests written in 2.1

**Acceptance Criteria:**
- All 2-4 connection UI tests pass ✅ (3 tests passed)
- Users can input vault path and connect ✅
- Clear visual feedback for success/failure ✅

---

#### Task Group 3: Folder Tree View Component
**Dependencies:** Task Group 2

- [x] 3.0 Complete folder tree view
  - [x] 3.1 Write 3-5 focused tests for tree component
    - Test tree rendering with nested structure
    - Test folder expand/collapse functionality
    - Test file selection state
    - Test PARA folder highlighting (Project/, Areas/, Resources/, Archive/)
  - [x] 3.2 Create FolderTree component
    - Recursive tree node rendering
    - Folder icons with expand/collapse arrows
    - File count badge next to folders
    - Indentation for hierarchy levels
  - [x] 3.3 Create FileItem component
    - Display filename
    - Display relative time for last modified ("3일 전", "1주 전")
    - Display folder path in smaller text
    - Selection highlight on click
  - [x] 3.4 Implement PARA folder styling
    - Visual emphasis for Project/, Areas/, Resources/, Archive/ folders
    - Distinct colors or icons for each PARA category
  - [x] 3.5 Create RefreshButton component
    - Position at top of tree view
    - Loading spinner during refresh
    - Call `GET /api/vault/files` on click
  - [x] 3.6 Apply responsive sidebar layout
    - Left sidebar placement
    - Collapsible on mobile
    - Scrollable tree content
  - [x] 3.7 Ensure tree view tests pass
    - Run ONLY the 3-5 tests written in 3.1

**Acceptance Criteria:**
- All 3-5 tree view tests pass ✅ (5 tests passed)
- Tree displays correct folder hierarchy ✅
- Folders expand/collapse properly ✅
- PARA folders are visually distinct ✅
- Refresh updates the tree ✅

---

### Integration & Testing

#### Task Group 4: Integration Testing
**Dependencies:** Task Groups 1-3

- [x] 4.0 Complete integration testing
  - [x] 4.1 Review all tests from Task Groups 1-3
    - Review 4-6 backend tests (Task 1.1)
    - Review 2-4 connection UI tests (Task 2.1)
    - Review 3-5 tree view tests (Task 3.1)
    - Total existing tests: approximately 9-15 tests
  - [x] 4.2 Write up to 5 integration tests
    - End-to-end: Connect vault → View tree → Select file
    - Refresh flow: Connect → Refresh → Verify update
    - Error recovery: Invalid path → Show error → Try again
  - [x] 4.3 Run feature-specific tests only
    - Run all tests from 1.1, 2.1, 3.1, and 4.2
    - Expected total: approximately 14-20 tests
    - Verify all critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass ✅ (22 tests total: 14 backend + 8 frontend)
- End-to-end vault connection workflow works ✅
- Tree view correctly reflects vault structure ✅
- Refresh functionality updates display ✅

---

## Execution Order

Recommended implementation sequence:
1. **Backend Layer** (Task Group 1) - API first for frontend integration
2. **Vault Connection UI** (Task Group 2) - Enable testing against real API
3. **Folder Tree View** (Task Group 3) - Display vault contents
4. **Integration Testing** (Task Group 4) - Verify complete workflow

## Tech Stack Reference

- **Backend**: Python (FastAPI)
- **Frontend**: React + Tailwind CSS
- **No database required** for this feature (in-memory vault path storage)
