# [PRD] Obsidian AI: PARA 기반 지식 관리 및 프로젝트 대시보드

## 1. 프로젝트 개요

- **목적:** 사용자의 옵시디언 노트를 AI가 학습하여 질문에 답하고, PARA 방법론에 기반한 프로젝트 진행률 및 복습 주기를 관리하는 통합 지식 관리 도구.
- **대상 사용자:** 옵시디언을 제2의 뇌로 활용하며, 지식의 유기적 연결과 체계적인 프로젝트 관리를 원하는 사용자.

## 2. 주요 기능 (Key Features)

### ① 지능형 RAG 채팅 (Semantic Search & Chat)

- **임베딩:** 옵시디언 `.md` 파일들을 벡터화하여 Vector DB에 저장.
- **멀티 모델 지원:** OpenAI, Gemini, Ollama(로컬) 중 선택 가능.
- **증분 업데이트:** 파일 수정/추가 시 전체를 다시 임베딩하지 않고, 변경된 파일만 식별하여 Vector DB를 업데이트 (File Hash 비교 방식 추천).

### ② PARA 프로젝트 대시보드

- **구조 분석:** `Project/` 폴더 하위의 디렉토리를 개별 프로젝트로 인식.
- **진척도 관리:** 유저가 수동으로 입력한 달성률(%) 저장.
- **유기 프로젝트 식별:** 각 폴더 내 파일들의 `last_modified_date`를 추적하여 일정 기간(예: 2주) 수정이 없는 프로젝트를 '유기(Stale)' 상태로 표시.
- **시각화:** React와 Tailwind를 활용한 깔끔한 카드형/리스트형 대시보드.

### ③ 에빙하우스 복습 엔진 (Memory Boost)

- **방식 제안:** **태그(#review) 기반 관리**를 추천합니다. 폴더는 위치가 바뀔 수 있지만, 태그는 속성을 유지하기 때문입니다.
- **로직:** * 노트의 YAML 메타데이터에 `last_review_date`와 `review_count` 추가.
    - 에빙하우스 주기(1일, 3일, 7일, 14일, 30일)에 도달한 노트를 우선 노출.
    - 초기 단계에서는 '랜덤 복습' 버튼을 통해 전체 지식을 가볍게 훑기.

---

## 3. 기술 스택 (Tech Stack)

| **구분** | **기술** | **비고** |
| --- | --- | --- |
| **Language** | Python 3.10+ | FastAPI 또는 Flask (백엔드) |
| **Frontend** | React, Tailwind CSS | Vite 환경 추천 |
| **Vector DB** | **ChromaDB** | 로컬 저장이 쉽고 파이썬 라이브러리가 매우 강력함 |
| **Embedding** | BGE-M3 (Local) / text-embedding-3-small (Cloud) | LangChain 또는 LlamaIndex 활용 |
| **LLM Orchestration** | LangChain / LlamaIndex | Ollama 및 API 연동 용이 |
| **Deployment** | Docker, Docker-Compose | 컨테이너 기반 환경 구성 |
| **Desktop Tool** | Electron 또는 **Tauri** | 추후 Mac App 전환 시 Tauri |

---

## 4. 데이터 흐름 및 아키텍처

### ETL 프로세스 (Extract, Transform, Load)

1. **Extract:** 옵시디언 로컬 폴더 감시 (Python `watchdog` 라이브러리).
2. **Transform:** Markdown 파싱 (YAML 메타데이터 추출 + 본문 Chunking).
3. **Load:** Vector DB(ChromaDB)에 Upsert 및 SQLite(메타데이터/진척도 저장용) 업데이트.

---

## 5. 상세 로직 가이드

### 1) Vector DB 선택: 왜 ChromaDB인가?

- 초보자가 사용하기 가장 쉽고, Docker로 띄우기 매우 간편합니다.
- 데이터를 로컬 파일(`sqlite` 기반)로 저장하므로, Mac 앱으로 패키징할 때 별도의 외부 서버가 필요 없습니다.

### 2) 증분 업데이트 (Sync) 전략

- 모든 파일의 `(파일명, 최종수정시간)` 리스트를 DB에 관리합니다.
- 앱 실행 시 또는 주기적으로 폴더를 스캔하여 수정시간이 바뀐 파일만 다시 `embedding` -> `vector update`를 수행합니다.

### 3) PARA 대시보드 구현 팁

- `Project/Project_A` 폴더 안의 모든 `.md` 파일의 수정 날짜 중 **가장 최근 것**을 해당 프로젝트의 '최종 활동일'로 간주합니다.
- `Last_Modified > 30일`인 경우 대시보드에서 붉은색 경고 표시를 하여 '유기된 프로젝트'임을 알립니다.

---

## 6. 개발 로드맵 (Phase)

- **Phase 1 (MVP):** * Python 스크립트로 옵시디언 폴더 읽어서 ChromaDB에 넣기.
    - Ollama/GPT 연동하여 터미널에서 채팅하기.
- **Phase 2 (Dashboard):** * FastAPI 서버 구축.
    - React + Tailwind로 PARA 프로젝트 리스트 및 진척도 표시.
- **Phase 3 (Review & Sync):**
    - 파일 변경 감지 로직 추가.
    - 복습 알고리즘 적용 및 '오늘의 복습' 알림 기능.
- **Phase 4 (Packaging):**
    - Docker-compose 구성.
    - Tauri를 이용한 Mac용 앱 빌드 시도.

---

## 7. 조언: "프론트와 Mac 앱을 잘 모른다면?"

1. **프론트:** 처음부터 복잡하게 만들지 마세요. **shadcn/ui**라는 컴포넌트 라이브러리를 사용하면 Tailwind 기반으로 아주 고급스러운 UI를 복사-붙여넣기 수준으로 만들 수 있습니다.
2. **Mac 앱:** 처음에는 웹 브라우저에서 사용하는 방식으로 개발하세요. 그 후 **Tauri**라는 프레임워크를 쓰면 현재 만든 React 웹사이트를 그대로 Mac 앱 파일(`.dmg`)로 구워낼 수 있습니다. (Rust 기반이지만 설정만 하면 됩니다.)

**다음 단계로 무엇을 도와드릴까요?**

1. *프로젝트 구조(폴더 구조)**를 짜드릴까요?
2. **ChromaDB와 BGE-M3를 활용한 기본 Python 코드** 예시를 짜드릴까요?
3. **PARA 대시보드용 데이터 모델(DB 테이블)** 설계를 도와드릴까요?

## 고려해야 할 것.

1. 옵시디언 노트 링크
2. vector DB에 대해서 chunk단위로만 가져오기 때문에… 예를들어 AAB awords 에 대해서 질문하면 그 상과 관련된 chunk만 불러오고, 누가 그 상을 탔는지는 그 노트 상단에 위치해 있기 때문에 그런 정보를 가져오지는 않는거 같음
3. 한 세션에서 계속 대화를 할 경우 토큰 소모량이 많아지니… 질문할 때 3000토큰 이상이면 토큰알림을 주는 그런것도 생각중(api 사용시만)
4. 대화세션은 json 형태로 저장? 또, 이거는 날짜별/첫 세션 질문 10자정도 폴더 생성해서 저장할지..
5. 대화 세션에서 retrieve 를 어디까지 할지… 세션이 길어지면 이걸 결정하기 어려워질듯
6. 한글, 영어 혼용으로 쓰기 때문에. 현재 강의에서 보면 Avery가 누구야? 하면 잘 찾는데 에이버리가 누구야? 하면 잘 못찾음. 영어는 averi 라고 해도 오타를 알아보고 잘 찾는데… 이거는 어떻게 처리해야하지? 한번 중간단계에 llm에게 영어 또는 한글을 찾는걸 넣어야 하나? 하지만 이러면 좀 복잡해지고 좋은 방법은 아닌거같은데..이거 처리하기 어려워 보임.
