# PR 제목
- `feat : 약어 제거 및 Jira형 협업 UX 개편(overview/deadlines/team)`

# 변경 목적
- 우측 영어 약어 제거 및 사이드바 토글 접근성 개선
- 관리자 접근 문맥 불일치(노출/권한/리다이렉트) 해소
- Jira형 실행 흐름(백로그/스프린트/칸반/블로커) 반영
- `/overview` 기반 팀 현황 파악 동선 확립

# 주요 작업 내용
- 네비/레이아웃
  - 사이드바 약어 배지 제거
  - 아이콘형 토글 + `aria-controls`/`aria-expanded` 적용
  - 관리자 링크를 권한 가능한 워크스페이스 문맥으로 연결
  - 워크스페이스 전환 UI 추가
- 데이터/API
  - `tasks` 확장: `sprint_key`, `is_blocked`, `blocked_reason`, `sort_order`
  - `POST /api/tasks`, `PATCH /api/tasks/[taskId]` 입력 확장
  - `PATCH /api/tasks/reorder` 신규
  - `GET /api/workspace-members` 신규
- 페이지/UX
  - `/overview` 신설 + 기본 진입 `/` -> `/overview`
  - `/deadlines` 신설(14일 타임라인 + 위험 목록)
  - `/tasks` Jira형 워크벤치 개편
  - `/team` 신설(역할 현황 조회, 오너 역할 변경)
  - `/admin` 무권한 접근 시 `/overview` 리다이렉트

# 리서치 반영 요약
- Jira: 백로그/리포트 중심 운영 흐름 반영
- Notion: 다중 뷰 기반 정보 탐색 반영
- Linear: 빠른 전환/집중형 실행 경험 참고
- W3C ARIA: 토글/탐색 접근성 속성 반영

# 테스트/검증 결과
- 단위 테스트
  - `tasks` 확장 필드 및 reorder 동작 검증
  - `workspace-members` 접근 권한 검증
- E2E
  - `/overview`, `/deadlines`, `/team` 표시 흐름 검증
  - 기존 온보딩/CRUD 흐름과 병행 확인
- 실행 명령
  - `npm --prefix apps/web run lint`
  - `npm --prefix apps/web run test`
  - `npm --prefix apps/web run build`
  - `npm --prefix apps/web run test:e2e`

# 커밋 구성
- `docs : 프론트 개편 설계 문서 추가`
- `feat : 사이드바 약어 제거 및 토글 접근성 UX 개편`
- `feat : 작업 모델 확장(sprint/blocker/order) 및 tasks API 확장`
- `feat : overview/deadlines 페이지 신설 및 기본 진입 전환`
- `feat : tasks 화면 Jira형(백로그/스프린트/블로커) 기능 추가`
- `feat : team 역할 관리 페이지 및 관리자 접근 가시성 개선`
- `test : 개편 범위 단위/E2E 회귀 테스트 갱신`
- `docs : 운영 가이드 및 PR 본문 개조식 정리`

# 제외 항목
- 기존 워킹트리 타 변경은 본 PR 범위에서 제외
  - 예: `apps/web/package-lock.json`, `README.md`, `apps/web/middleware.ts`, `apps/web/scripts/seed.ts`, `apps/web/src/lib/data/store-provider.ts` 등

# 후속 과제
- 초대/수락 기반 역할 관리 흐름 추가
- 스프린트 생성/완료 주기 관리 UI 고도화
- 번다운/리드타임 등 운영 리포트 확장
