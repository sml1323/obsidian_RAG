# Spec Requirements: 2026-01-07-para-project-folder-recognition

## Initial Description
PARA Project Folder Recognition

## Requirements Discussion

### First Round Questions

**Q1:** I assume we should look for a top-level folder named `Projects` or `2. Projects` (standard PARA) in the Obsidian Vault. Is that correct, or should we support custom folder names/paths?
**Answer:** 시스템이 특정 폴더명을 자동으로 찾는 대신, 사용자가 설정 화면에서 '프로젝트 대분류 디렉토리 경로'를 직접 입력하거나 지정할 수 있도록 구현해 주세요. 사용자가 지정한 경로가 Projects이든 2. Projects이든 상관없이 해당 경로를 루트로 인식해야 합니다.

**Q2:** I'm thinking we define a "Project" as **any immediate subfolder** within that main Projects folder. Should we also consider markdown files directly in the Projects folder as projects, or just folders?
**Answer:** 지정된 루트 폴더 바로 아래에 있는 각각의 하위 폴더(immediate subfolder)를 하나의 개별 프로젝트로 인식합니다. 루트 폴더에 직접 위치한 마크다운 파일들은 프로젝트로 간주하지 않고 제외합니다.

**Q3:** For "recognition", I assume the goal is to expose a new API endpoint (e.g., `/projects`) that returns a list of projects with basic metadata (path, name, note count). Is this purely backend work, or should we include a basic UI list in the frontend for this spec?
**Answer:** 이 스펙은 백엔드 API(/projects) 개발과 이를 시각화하는 프론트엔드 UI 작업을 모두 포함합니다. 프론트엔드에서는 Google Antigravity 컴포넌트를 사용하여 프로젝트 리스트를 트리 또는 카드 형태로 보여주는 기초 작업을 진행해 주세요.

**Q4:** Aside from the folder structure, are there any specific "status" indicators we should parse (e.g., tags like `#active`, `#done` inside notes)? Or just sticking to folder existence for now?
**Answer:** PoC 단계에서는 노트 내부의 태그(#active 등)를 파싱하지 않고, **폴더의 존재 여부와 파일들의 메타데이터(마지막 수정일)**에 집중합니다. 프로젝트의 '달성률(%)'은 사용자가 UI에서 직접 입력하고 수정하는 수동 방식으로 먼저 구현합니다.

**Q5:** Are there any folders or files we should explicitly exclude (e.g., `.DS_Store`, `_assets`)?
**Answer:** .obsidian/, .trash/, node_modules/, .DS_Store 등 모든 설정 및 숨김 폴더를 제외합니다. 또한, 프로젝트 내에서도 마크다운 파일(.md)만 인식하고 이미지나 PDF 등은 결과에서 제외해 주세요.

### Existing Code to Reference
6. Existing Code Reuse (기존 코드 재사용)
**Answer:** 1단계에서 구현한 **Vault 스캐너(파일 워킹 로직)**를 재사용하여 지정된 특정 경로 하위를 탐색하도록 확장해 주세요. 폴더와 파일을 구분하는 데이터 모델도 기존 형식을 따르거나 확장해서 사용하면 됩니다.

**Similar Features Identified:**
- Feature: Vault Scanner - Path: `backend/app/vault_scanner.py`
- Components to potentially reuse: Antigravity components for List/Card UI (Frontend)
- Backend logic to reference: File walking logic in `vault_scanner.py`

### Follow-up Questions
No follow-up questions were needed as the initial answers were comprehensive.

## Visual Assets

### Files Provided:
No visual assets provided.

## Requirements Summary

### Functional Requirements
- **Configuration**: User can input/configure the "Project Root Path" (e.g., "Projects" or "2. Projects").
- **Project Recognition**:
    - Recognize immediate subfolders of the configured root as "Projects".
    - Ignore files directly in the root folder.
    - Exclude system/hidden folders (`.obsidian`, `.trash`, etc.) and non-markdown files.
- **Backend API**:
    - Endpoint (`/projects`) to return list of projects.
    - Metadata per project: Path, Name, Note Count, Last Modified Date (calculated from files within).
- **Frontend UI**:
    - Basic List or Card view using Antigravity components.
    - Display: Project Name, File Count, Last Modified.
    - **Manual Progress Input**: UI allows user to manually input/update "Progress (%)" for each project.

### Reusability Opportunities
- **Backend**: Reuse/Extend `backend/app/vault_scanner.py` for traversing the specific project sub-tree.
- **Frontend**: Reuse existing Antigravity UI components (Lists/Cards).

### Scope Boundaries
**In Scope:**
- Backend API for fetching projects from user-defined root.
- Frontend UI for listing projects.
- Manual progress tracking (user input).
- Calculating "Last Modified" from file metadata.

**Out of Scope:**
- Automatic parsing of tags (`#active`, `#done`) for status.
- Recursive project structures (nested projects).
- Parsing non-markdown files (images/PDFs) for project content.

### Technical Considerations
- **Status/Progress**: Manual input for now, stored presumably in the backend or local state (Need to decide persistence strategy in design phase - likely local JSON or DB if available, referencing the "Settings & User Env Save" roadmap item, but for this spec might just be in-memory or simple file for PoC if DB isn't fully ready for user prefs. *Self-correction based on roadmap: Roadmap item 8 "Settings" is not done. This spec might need a temporary way to store this manual progress, or just display it if we can store it in a simple sidecar file or just in the DB if we already have one for embeddings. The prompt implies we have ChromaDB, maybe we can use metadata there or just a simple JSON file for now since full settings is later.*) -> **Refinement**: User mentioned "Status" is manual. We will likely need a minimal persistence for this manual value, or it might be ephemeral for this specific PoC step if not specified otherwise. I'll treat persistence as a clear requirement to resolve during `create-spec` design.
