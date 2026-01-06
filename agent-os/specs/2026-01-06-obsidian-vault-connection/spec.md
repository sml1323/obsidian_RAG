# Specification: Obsidian Vault 연결

## Goal
사용자가 로컬 옵시디언 볼트의 경로를 입력하면, 해당 볼트 내 마크다운 파일들을 폴더 계층 구조를 유지한 트리 형태로 표시하고, 각 파일의 메타데이터(파일명, 수정일, 경로)를 함께 보여주는 기능.

## User Stories
- As a 옵시디언 파워 유저, I want to 볼트 경로를 입력하여 내 노트 목록을 한눈에 볼 수 있도록 so that AI 기반 지식 탐색의 첫 단계를 수행할 수 있다.
- As a PARA 방법론 사용자, I want to Project/, Areas/ 등의 폴더 구조가 시각적으로 구분된 트리 뷰로 표시되도록 so that 내 지식 체계를 직관적으로 파악할 수 있다.

## Specific Requirements

**볼트 경로 입력 UI**
- 메인 화면 상단에 텍스트 입력 필드와 "연결" 버튼 배치
- 사용자가 절대 경로를 직접 입력 (예: `/Users/username/Documents/ObsidianVault`)
- 연결 성공/실패 상태를 시각적으로 피드백 (성공: 녹색 체크, 실패: 에러 메시지)
- 입력된 경로는 세션 동안 유지

**백엔드 볼트 스캔 API**
- FastAPI 엔드포인트: `POST /api/vault/connect` (경로 수신)
- FastAPI 엔드포인트: `GET /api/vault/files` (파일 목록 반환)
- 재귀적으로 볼트 디렉토리 탐색하여 `.md` 파일만 수집
- 각 파일의 메타데이터 반환: 파일명, 상대 경로, 마지막 수정 시간(ISO 8601)
- 폴더 계층 구조를 JSON 트리 형태로 반환

**제외 규칙 (하드코딩)**
- `.obsidian/` 폴더 및 하위 파일 제외
- `.trash/` 폴더 및 하위 파일 제외
- `node_modules/` 폴더 및 하위 파일 제외
- 제외 폴더 목록은 상수로 정의하여 향후 확장 용이하게 설계

**폴더 트리 뷰 컴포넌트**
- 좌측 사이드바에 폴더 계층 구조 트리 배치
- 폴더는 펼침/접힘 토글 가능 (화살표 아이콘)
- PARA 대분류 폴더 (Project/, Areas/, Resources/, Archive/) 시각적 강조
- 각 폴더 옆에 하위 파일 개수 표시

**파일 목록 표시**
- 파일명 클릭 시 추후 상세 보기 연동을 위한 선택 상태 표시
- 각 파일 항목에 마지막 수정일 표시 (상대 시간: "3일 전", "1주 전" 등)
- 폴더 경로를 파일명 아래 작은 글씨로 표시

**수동 새로고침**
- 트리 뷰 상단에 새로고침 버튼 배치
- 버튼 클릭 시 `GET /api/vault/files` 재호출하여 목록 갱신
- 새로고침 중 로딩 인디케이터 표시

## Visual Design
No visual mockups provided. Antigravity와 Tailwind CSS 기본 스타일을 활용하여 깔끔한 사이드바 트리 구조와 메인 리스트 뷰 구성.

## Existing Code to Leverage
프로젝트 초기 단계로 참조할 기존 코드 없음. 이 기능의 트리 컴포넌트는 향후 PARA Project Monitor 기능에서 재사용될 수 있도록 범용적으로 설계.

## Out of Scope
- 폴더 선택 다이얼로그 UI (Tauri 전환 시 구현 예정)
- 다중 볼트 동시 연결 기능
- 실시간 파일 변경 감시 (Watchdog 기반 자동 갱신)
- 사용자 정의 제외 규칙 설정 UI
- 파일 내용 미리보기 기능
- 파일 검색 기능
- 파일 정렬 옵션 (이름순, 수정일순 등)
