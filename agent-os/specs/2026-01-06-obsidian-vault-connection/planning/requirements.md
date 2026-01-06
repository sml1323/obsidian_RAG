# Spec Requirements: Obsidian Vault 연결

## Initial Description
사용자가 로컬 옵시디언 볼트 경로를 지정하면 마크다운 파일 목록을 읽어와 표시하는 기능.

## Requirements Discussion

### First Round Questions

**Q1:** 볼트 경로 입력 방식: 사용자가 볼트 경로를 직접 텍스트로 입력하는 방식으로 가정합니다. 맞나요, 아니면 파일 브라우저(폴더 선택 다이얼로그)를 제공해야 하나요?
**Answer:** 초기 PoC 단계에서는 경로를 직접 텍스트로 입력하는 방식으로 진행합니다. (백엔드가 로컬 환경에서 실행되므로 절대 경로를 직접 처리하는 것이 구현이 가장 빠릅니다. 나중에 Tauri Mac 앱으로 전환할 때 폴더 선택 다이얼로그로 고도화하겠습니다.)

**Q2:** 다중 볼트 지원: 초기 MVP에서는 한 번에 하나의 볼트만 연결하는 것으로 가정합니다. 여러 볼트를 동시에 연결하는 기능은 이후 확장으로 미룰까요?
**Answer:** 맞습니다. 초기 MVP에서는 한 번에 하나의 볼트만 연결합니다. 다중 볼트 기능은 나중에 확장 기능으로 미룹니다.

**Q3:** 노트 목록 표시 정보: 마크다운 파일 목록에 파일명만 표시할지, 아니면 수정일, 파일 크기, 폴더 경로 등 추가 메타데이터도 함께 표시할까요?
**Answer:** 파일명, 마지막 수정일, 그리고 폴더 경로를 함께 표시해야 합니다. 특히 '마지막 수정일'은 나중에 유기된 프로젝트를 식별하는 데 필수적인 데이터입니다.

**Q4:** 폴더 구조 반영: 노트 목록을 플랫(flat) 리스트로 보여줄지, 아니면 볼트의 폴더 계층 구조를 유지해서 트리 형태로 보여줄까요?
**Answer:** 볼트의 폴더 계층 구조를 유지해서 트리(Tree) 형태로 보여주세요. PARA 기법을 사용하므로 Project/, Areas/ 등의 대분류 폴더를 시각적으로 구분하는 것이 매우 중요합니다.

**Q5:** 실시간 동기화: 볼트 경로 지정 후 파일 변경 시 자동으로 목록이 업데이트되어야 하나요, 아니면 사용자가 수동으로 새로고침해야 하나요?
**Answer:** 첫 단계에서는 초기 스캔 및 수동 새로고침 버튼을 제공하는 것으로 충분합니다. 실시간 감시(Watchdog)는 추후 인덱싱 고도화 단계에서 다루겠습니다.

**Q6:** 제외 대상: `.obsidian/` 설정 폴더나 특정 패턴의 파일(예: `_template.md`)을 목록에서 제외해야 하나요? 제외 규칙을 사용자가 설정할 수 있어야 할까요?
**Answer:** .obsidian/, .trash/, node_modules/ 폴더와 그 안의 파일들은 목록에서 반드시 제외해야 합니다. 제외 규칙은 우선 하드코딩으로 빠르게 처리하고, 사용자가 설정하는 기능은 나중에 추가하겠습니다.

### Existing Code to Reference

No similar existing features identified for reference. (프로젝트 초기 단계)

### Follow-up Questions

No follow-up questions needed.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
- 사용자는 Antigravity와 Tailwind CSS의 기본 스타일을 활용하여 깔끔한 사이드바 트리 구조와 메인 리스트 뷰를 구성해달라고 요청함.

## Requirements Summary

### Functional Requirements
- 사용자가 텍스트 입력으로 로컬 옵시디언 볼트 절대 경로를 지정
- 볼트 내 마크다운 파일들을 스캔하여 목록으로 표시
- 파일명, 마지막 수정일, 폴더 경로 메타데이터 표시
- 폴더 계층 구조를 유지한 트리(Tree) 형태로 표시
- 수동 새로고침 버튼으로 파일 목록 업데이트
- 한 번에 하나의 볼트만 연결

### Technical Requirements
- 제외 폴더: `.obsidian/`, `.trash/`, `node_modules/` (하드코딩)
- Backend: FastAPI 엔드포인트로 볼트 경로 수신 및 파일 스캔
- Frontend: React 기반 사이드바 트리 컴포넌트 + 메인 리스트 뷰

### Reusability Opportunities
- 프로젝트 초기 단계이므로 참조할 기존 코드 없음
- 이 기능의 트리 컴포넌트는 이후 PARA Project Monitor에서 재사용 가능

### Scope Boundaries
**In Scope:**
- 볼트 경로 텍스트 입력 UI
- 마크다운 파일 스캔 백엔드 API
- 폴더 계층 트리 뷰 프론트엔드 컴포넌트
- 파일 메타데이터 (파일명, 수정일, 경로) 표시
- 수동 새로고침 기능
- 하드코딩된 제외 규칙

**Out of Scope:**
- 폴더 선택 다이얼로그 (Tauri 전환 시 구현)
- 다중 볼트 동시 연결
- 실시간 파일 변경 감시 (Watchdog)
- 사용자 정의 제외 규칙 설정 UI
- 파일 내용 미리보기

### Technical Considerations
- 로컬 환경에서 실행되는 백엔드가 절대 경로를 직접 처리
- PARA 방법론 기반 폴더 구조 (Project/, Areas/, Resources/, Archive/) 시각적 구분 중요
- 마지막 수정일 데이터는 향후 "방치된 프로젝트 식별" 기능의 기반
