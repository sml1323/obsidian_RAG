# Product Roadmap

1. [x] **Obsidian Vault 연결** — 사용자가 로컬 옵시디언 볼트 경로를 지정하면 마크다운 파일 목록을 읽어와 표시하는 기능. `S`

2. [x] **노트 임베딩 파이프라인** — 선택된 볼트의 노트를 청킹하고 ChromaDB에 벡터 임베딩으로 저장하는 백엔드 파이프라인 구축. `M`

3. [x] **기본 RAG Chat** — 임베딩된 노트를 기반으로 Ollama 로컬 모델과 대화할 수 있는 채팅 인터페이스 구현. `M`

4. [x] **클라우드 모델 연동** — OpenAI/Gemini API 키를 설정하고 로컬 대신 클라우드 모델로 RAG 채팅을 수행하는 옵션 추가. `S`

5. [ ] **PARA Project 폴더 인식** — Project/ 폴더 구조를 파싱하여 프로젝트 목록과 각 프로젝트 내 노트들을 추출하는 기능. `S`

6. [ ] **Project Monitor 대시보드** — 각 프로젝트의 마지막 수정일, 사용자 설정 달성률(%), 방치 기간을 시각화하는 대시보드 UI. `M`

7. [ ] **Smart Reviewer (랜덤 복습)** — 전체 노트 중 랜덤하게 N개를 선별하여 "오늘의 복습" 목록으로 제시하는 기능. `S`

8. [ ] **설정 및 사용자 환경 저장** — 볼트 경로, 모델 선택, API 키, 프로젝트별 달성률 등 사용자 설정을 로컬에 저장/불러오기. `S`

9. [ ] **Docker Compose 통합 환경** — FastAPI 백엔드와 React 프론트엔드를 Docker Compose로 한 번에 실행 가능하도록 구성. `S`

10. [ ] **Tauri Mac 앱 패키징** — 웹 PoC를 Tauri로 래핑하여 macOS 네이티브 앱으로 빌드 및 배포 준비. `L`

> Notes
> - Order items by technical dependencies and product architecture
> - Each item should represent an end-to-end (frontend + backend) functional and testable feature
> - 1-5: Core RAG 기능 (MVP)
> - 6-7: PARA 및 복습 기능 (핵심 차별화)
> - 8-10: 배포 및 패키징 (제품화)
