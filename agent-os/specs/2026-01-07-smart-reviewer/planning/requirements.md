# Spec Requirements: smart-reviewer

## Initial Description
Smart Reviewer (랜덤 복습) — 전체 노트 중 랜덤하게 N개를 선별하여 "오늘의 복습" 목록으로 제시하는 기능.

## Requirements Discussion

### First Round Questions

**Q1:** Selection Strategy (선택 전략) - 기본적으로 전체 볼트에서 무작위로 선택하되, Templates, Archive 폴더 및 모든 숨김 폴더(.obsidian 등)는 제외해 주세요.
**Answer:** 기본적으로 전체 볼트에서 무작위로 선택하되, Templates, Archive 폴더 및 모든 숨김 폴더(.obsidian 등)는 제외해 주세요. 나중에 에빙하우스 주기를 적용할 예정이므로, 지금은 가볍게 필터링된 무작위 추출로 시작합니다.

**Q2:** Number of Notes (N, 복습 개수) - 기본값은 5개로 설정하되, 설정 화면이나 복습 섹션 상단에서 사용자가 숫자를 변경할 수 있는 간단한 UI 입력창을 제공해 주세요.
**Answer:** 기본값은 5개로 설정하되, 설정 화면이나 복습 섹션 상단에서 사용자가 숫자를 변경할 수 있는 간단한 UI 입력창을 제공해 주세요.

**Q3:** Refresh Frequency (갱신 주기) - 초기화 시 새로 생성 또는 버튼 제공
**Answer:** MVP 단계에서는 구현이 쉬운 '페이지/컴포넌트 로드 시 새로운 리스트 생성' 방식을 사용하겠습니다. 다만, 사용자가 마음에 들지 않을 경우를 대비해 '새로고침(Shuffle)' 버튼을 UI에 추가해 주세요.

**Q4:** UI Placement (UI 위치) - 메인 대시보드
**Answer:** 메인 대시보드의 한 섹션으로 배치해 주세요. 사용자가 앱을 켰을 때 'Project Monitor'와 함께 '오늘의 복습' 리스트가 바로 보이는 것이 중요합니다.

**Q5:** Interaction (상호작용) - 클릭 시 동작
**Answer:** 리스트의 항목을 클릭하면 RAG Chat 뷰와 유사하게 앱 내에서 해당 노트의 전체 내용(Full Content)을 보여주어야 합니다. 복습은 내용을 다시 읽는 것이 핵심이기 때문입니다.

**Q6:** 제외 대상
**Answer:** 이전에 설정한 것과 동일하게 마크다운 파일(.md) 이외의 모든 확장자를 제외합니다. 또한 앞서 언급한 Archive, Templates 등 관리용 폴더도 제외 대상입니다.

### Existing Code to Reference
Based on user's response about similar features:

**Similar Features Identified:**
- Feature: Vault Scanner - Path: (Reference `vault_scanner.py` logic)
- Feature: Note Loader - Path: (Reference logic used in RAG chat for reading note content)
- Components to potentially reuse: Project Monitor card/list components from Frontend.
- Backend logic to reference: 1단계에서 만든 Vault 스캐너와 2단계의 노트 로더 로직을 재사용하여 파일 목록을 가져오고 내용을 읽어오세요.

### Follow-up Questions
No follow-up questions were necessary as the user provided comprehensive answers in the first round.

## Visual Assets

### Files Provided:
No visual files found.

### Visual Insights:
No visual assets provided.
- User requested to use "Antigravity's list components" for a clean "Today's Review" card list.

## Requirements Summary

### Functional Requirements
- **Random Selection**: Select 5 random notes from the vault.
- **Filtering**: Exclude `Templates`, `Archive`, hidden folders (starting with `.`), and non-markdown files.
- **Display**: Show "Today's Review" section in the Main Dashboard.
- **Configurability**: Allow user to change the number of notes (N defaults to 5) via a simple UI input.
- **Refresh**: Generate new list on page load + provided "Shuffle" button to manually regenerate.
- **Interaction**: Clicking a note opens its full content (read-only view similar to RAG chat context).

### Reusability Opportunities
- **Backend**: Reuse `vault_scanner.py` logic for traversing the vault and filtering files.
- **Backend API**: Likely need a new endpoint `GET /api/reviews/random` (or similar) that reuses the scanning logic but adds random sampling.
- **Frontend**: Reuse `ProjectCard` or `ProjectList` styles for uniformity.

### Scope Boundaries
**In Scope:**
- Random selection algorithm (simple math.random).
- Dashboard UI integration.
- Shuffle mechanism.
- Customizable 'N' count (transient or simple local state is fine for MVP).
- Full note viewer.

**Out of Scope:**
- Spaced Repetition (Ebbinghaus) logic (planned for future).
- Complex persistence of "Today's list" (refresh on reload is accepted).
- Editing the note content (Read-only for review).

### Technical Considerations
- **Performance**: Scanning the entire vault every time might be slow if the vault is huge. Consider if we can cache the file list or if `vault_scanner` is fast enough.
- **State Management**: React state for holding the current list of 5 notes.
- **API Design**: `GET /api/random-notes?count=5` seems appropriate.
