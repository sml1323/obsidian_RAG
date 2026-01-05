# Spec Requirements: Vault Indexer & Incremental Embeddings

## Initial Description
Vault Indexer & Incremental Embeddings — Index Obsidian vault into Chroma with a watcher that performs incremental embeddings on file change/create/delete, including backfill job and basic health metrics for the queue.

## Requirements Discussion

### First Round Questions

**Q1:** Assuming we watch the entire Obsidian vault for `.md` plus embedded asset files, should we exclude folders like `.obsidian/`, `node_modules/`, or large binary dirs to keep indexing lean?  
**Answer:** `.obsidian/`, `.trash/`, `node_modules/` 및 모든 숨김 폴더는 제외. 기본적으로 `.md` 파일만 수집하며 이미지 등 대용량 바이너리 디렉토리는 인덱싱 대상에서 제외해 가볍게 유지.

**Q2:** For the watcher, should we prefer an OS file event watcher (e.g., watchdog) with debounce and batch processing, or a periodic scan fallback for environments where file events are flaky?  
**Answer:** watchdog 라이브러리 사용. 짧은 시간 내 반복 수정을 방지하기 위해 Debounce(약 1~2초) 적용, 배치 처리 선호.

**Q3:** I’m planning to queue incremental embeddings per file change with deduping (only latest version enqueued) and a retry policy—do you want a max retry count with dead-letter logging, or infinite retries with backoff?  
**Answer:** 파일 변경 시 큐에 넣고 중복 제거(최신 버전만 유지). 최대 3회 재시도 후 실패 시 dead-letter log 기록. 무한 재시도는 지양.

**Q4:** Backfill: do we run a one-time full crawl at startup or expose a manual backfill command/API so users can trigger it on demand?  
**Answer:** 앱 초기 시작 시 1회 전체 크롤링으로 DB 동기화. 추가로 사용자가 원할 때 수동 전체 인덱싱을 트리거할 수 있는 API/명령어 제공.

**Q5:** Embedding providers: should we default to BGE-M3 locally, with a config switch for OpenAI `text-embedding-3-small`, and allow per-file model overrides for large docs or is a single global provider sufficient?  
**Answer:** BGE-M3(로컬)와 OpenAI(Cloud) 모두 지원. Strategy 패턴으로 설정에 따라 임베딩 엔진 교체 가능한 구조. 파일별 오버라이드보다 글로벌 설정 기반 교체를 우선.

**Q6:** Queue health metrics: are you expecting counts for queued/in-flight/failed, per-model usage, and processing latency histograms, or is a minimal set (queued + failed + last processed timestamp) enough?  
**Answer:** MVP로 최소 정보(대기 작업 수, 실패 수, 마지막 처리 타임스탬프)만 대시보드에 표시하면 충분.

**Q7:** Scope guardrails: are there any vault sections or file types we must never index, or operational limits (CPU, concurrency, memory) we should enforce?  
**Answer:** 동시성은 2~4개로 제한해 로컬 PC CPU 점유율 관리.

**Existing Code Reuse:**
Are there existing features in your codebase with similar patterns we should reference? For example:
- Similar interface elements or UI components to re-use
- Comparable page layouts or navigation patterns
- Related backend logic or service objects
- Existing models or controllers with similar functionality

Please provide file/folder paths or names of these features if they exist.  
**Answer:** 현재 프로젝트 초기 단계라 참조할 기존 코드는 없음. 프론트엔드는 Tailwind CSS와 Shadcn UI 예정, 구체적 시각 자료 없음. 기본 리스트형 대시보드 구상 중. 학습 목적: AI는 네이밍 컨벤션 체크, 모듈 경계 설정, 인덱싱 과정의 Template Method 패턴 후보를 제안. 코드 한꺼번에 작성 말고 설계 리뷰와 최소 인터페이스(Protocol/ABC) 위주 가이드 요청.

### Existing Code to Reference
No similar existing features identified for reference.

### Follow-up Questions
None asked yet.

## Visual Assets

### Files Provided:
No visual assets provided.

## Requirements Summary

### Functional Requirements
- Watch Obsidian vault with watchdog using 1–2s debounce and batch processing; exclude `.obsidian/`, `.trash/`, `node_modules/`, hidden folders; index `.md` only and skip large binaries.
- Incremental embedding queue per change with dedupe (latest only), max 3 retries then dead-letter log.
- Full crawl on startup for sync, plus manual full-index trigger via API/command.
- Embedding provider Strategy: global configurable BGE-M3 (local) or OpenAI `text-embedding-3-small` (cloud).
- Minimal metrics surfaced: queued count, failed count, last processed timestamp.
- Concurrency limited to ~2–4 workers to manage CPU.

### Reusability Opportunities
- Strategy pattern for embedding providers; Template Method candidate for indexing pipeline stages (filter → read → chunk → embed → upsert).
- Naming conventions and module boundaries to be reviewed; leverage Tailwind + shadcn/ui when UI is added.

### Scope Boundaries
**In Scope:**
- Vault watcher, incremental queue, dedupe, retry with dead-letter logging.
- Startup full crawl and manual reindex trigger.
- Minimal queue health metrics dashboard.
- Global provider switching via configuration.
- Concurrency limits.

**Out of Scope:**
- Per-file embedding provider overrides.
- High-fidelity UI design; only basic list dashboard concept noted.
- Extensive ops/metrics beyond minimal set.

### Technical Considerations
- Use watchdog for file events; batch with debounce.
- Filtering rules for folders/files; `.md` focus.
- Strategy pattern interface for embedding provider selection; Template Method for pipeline.
- Dead-letter storage/logging mechanism; consider file-based or simple DB entry.
- Concurrency controls for workers (2–4).
