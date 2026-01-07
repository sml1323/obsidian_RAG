# Task Breakdown: Smart Reviewer

## Overview
Total Tasks: 13

## Task List

### Backend Layer

#### Task Group 1: Review Logic & API
**Dependencies:** None

- [x] 1.0 Implement Smart Review Service & API
  - [x] 1.1 Write 2-4 focused tests for `SmartReviewService`
    - Test random selection logic
    - Test filtering (exclude Archive, Templates, .obsidian)
    - Test handling of N count
  - [x] 1.2 Implement `SmartReviewService` in `backend/app/services/smart_review.py`
    - Import `get_all_markdown_files` from `vault_scanner`
    - Implement filtering logic (regex or string check for 'Archive', 'Templates')
    - Implement random sampling
  - [x] 1.3 Write 2-4 focused tests for `GET /api/reviews/random` endpoint
    - Test successful response structure
    - Test `count` parameter
  - [x] 1.4 Implement `GET /api/reviews/random` in `backend/app/main.py`
    - Endpoint definition
    - Query param `count` (default 5)
    - Integration with `SmartReviewService`
  - [x] 1.5 Ensure backend tests pass
    - Run the focused tests from 1.1 and 1.3

**Acceptance Criteria:**
- Service correctly filters out Blacklisted folders
- Service returns requested number of random files
- API returns 200 OK with JSON list of files

### Frontend Components

#### Task Group 2: Review UI Components
**Dependencies:** Task Group 1

- [x] 2.0 Implement Review UI
  - [x] 2.1 Write 2-4 focused tests for `ReviewCard` and `ReviewList`
    - Test rendering of card with file data
    - Test "Shuffle" button click handler
  - [x] 2.2 Create `ReviewCard` component
    - props: file name, path, modified date
    - Click handler to trigger "Open Note" (reuse existing note viewer/chat logic if possible or just emit event)
  - [x] 2.3 Create `ReviewList` component
  - [x] 2.4 Integrate into Dashboard
    - Add `ReviewList` to `App.jsx` or Main Dashboard view
    - Ensure it sits alongside/below Project Monitor
  - [x] 2.5 Ensure frontend tests pass
    - Run the focused tests from 2.1

**Acceptance Criteria:**
- Cards display note info correctly
- Shuffle button refreshes the list
- Clicking a card opens the note (or logs action for MVP if viewer not ready)
- Integration matches "Main Dashboard" placement requirement

### Verification

#### Task Group 3: Final Verification
**Dependencies:** Task Group 2

- [x] 3.0 Verify Implementation
  - [x] 3.1 Perform manual verification
    - [x] Verify "Shuffle" generates new list
    - [x] Verify excluded folders are respected
    - [x] Verify "Open Note" works (triggers select file)
  - [x] 3.2 Fix any bugs found during verification Click -> Open Note interaction

**Acceptance Criteria:**
- Feature works end-to-end in the actual application
