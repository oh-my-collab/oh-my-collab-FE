# Jira급 협업툴 프론트엔드 전면 교체 구현 결과

작성일: 2026-02-28

## 목표
- Jira/Linear 수준 UX의 협업툴 정보구조로 프론트 전면 교체
- 기여도 추적 + AI 난이도 리포트 화면 구현
- `/api/mock/*` 기반 프론트 단독 동작 구조 확립

## 핵심 구현 범위
- App Router 라우트 재구성
  - 공개: `/`, `/login`
  - 보호: `/orgs`, `/orgs/[orgId]`, `/orgs/[orgId]/repos/[repoId]`, `/board`, `/issues`, `/issues/[issueId]`, `/requests`, `/reports`, `/reports/users/[userId]`, `/settings`
- 앱 셸 구축
  - 좌측 사이드바, 상단 헤더, 브레드크럼, 빠른 생성, 알림/프로필, 테마 토글
- 도메인 UI/상태/데이터 계층 분리
  - `features/*`, `components/*`, `lib/api/*` 구조
  - TanStack Query + Zustand + RHF/Zod 적용
- mock API 전면 구현
  - 세션, 조직/레포, 이슈 CRUD/재정렬, 요청 플로우, 리포트, 알림, 설정
- P1/P2/P3 화면 구현
  - Org/Repo 선택 흐름, 이슈 리스트/상세, 칸반 보드 DnD
  - 협업 요청 인박스/보낸 요청 + 작성 모달
  - 오너 리포트 대시보드 + 유저 drill-down
- 공통 UX 품질
  - Empty/Loading/Error/Skeleton/Toast
  - 다크모드 토글 및 저장
  - 접근성 라벨/포커스 상태 정비

## 마무리 수정(안정화)
- 이슈/요청 생성 다이얼로그 성공 시 자동 닫힘 처리
- E2E 셀렉터를 strict mode-safe 형태로 보강
  - 모호한 텍스트 셀렉터 제거
  - URL/heading level 기반 검증으로 전환
- RHF + Zod 타입 충돌 해결
  - `createIssueSchema` 사용 폼 타입을 `z.input<typeof createIssueSchema>`로 정렬

## 검증 결과
- `npm --prefix apps/web run lint` 통과
- `npm --prefix apps/web run test` 통과 (7 files, 17 tests)
- `npm --prefix apps/web run test:e2e` 통과 (3 tests)
- `npm --prefix apps/web run build` 통과 (Next.js 16.1.6)

## 비고
- 한국어 카피 기준으로 화면 문구 구성
- 기존 레거시 경로/API는 호환 유지 없이 제거 방향으로 정리
