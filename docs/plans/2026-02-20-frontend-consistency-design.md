# Frontend Consistency Design (2026-02-20)

## 1. Problem Summary
- 페이지별로 개별 Tailwind 클래스가 흩어져 있어 UI 일관성이 약함.
- 공통 레이아웃/내비게이션/디자인 토큰이 없어 유지보수 시 재발 가능성이 큼.
- 기본 템플릿 메타데이터와 폰트 의존이 남아 있어 배포 환경에서 불안정 요소가 있음.

## 2. Constraints
- 트렌드에 맞는 깔끔한 디자인.
- 신경 써서 만든 느낌의 시각 계층과 밀도.
- 메인 컬러는 1~2개만 사용.
- 검정/흰색/회색 등 무채색은 허용.

## 3. Approaches Considered
1. 전역 디자인 시스템 + 공통 레이아웃 리팩터링 (채택)
  - 장점: 일관성/재사용성/확장성 균형이 가장 좋음.
  - 단점: 초기 수정 범위가 중간 수준.
2. 페이지별 스타일만 부분 수정
  - 장점: 빠름.
  - 단점: 구조 문제를 해결하지 못해 회귀 가능성 높음.
3. 대규모 컴포넌트 시스템 구축
  - 장점: 장기 확장성 최상.
  - 단점: 현재 MVP 범위 대비 과도함.

## 4. Skill Mapping (find-skills 결과 기반)
- `brainstorming`: 문제 정의, 접근안 비교, 실행안 확정.
- `tailwind-design-system`: 토큰/컴포넌트 클래스 규칙 정리.
- `web-design-guidelines`: 타이포 계층/레이아웃 밀도/가독성 점검.
- `next-best-practices`: App Router 레이아웃 그룹 구조 정리.
- `verification-before-completion`: lint/test/build/e2e 검증.

참고: 네트워크 제한으로 `npx skills find` 실행은 실패하여, 로컬 설치 스킬 목록을 기반으로 매칭함.

## 5. Final Design Direction
- 메인 컬러: 블루 계열 1종(`--primary`, `--primary-strong`) + 무채색.
- 전역 토큰: 배경/표면/경계/타이포/버튼/칩/네비 상태를 `globals.css`에 통합.
- 레이아웃:
  - `(app)` 그룹: 사이드바 + 상단 헤더 + 공통 네비게이션.
  - `(marketing)` 그룹: 온보딩 중심 상단 헤더와 빠른 이동 링크.
- 페이지 통일:
  - `setup/tasks/goals/docs/insights`에 동일한 카드/헤더/요약 패턴 적용.
- 안정성:
  - 외부 Google Font fetch 의존 제거(오프라인/제한 네트워크 빌드 안정화).

## 6. Acceptance Checks
- 시각 일관성: 공통 클래스(`surface-card`, `page-title`, `nav-link`, `chip`) 중심으로 구성.
- 색상 정책: 블루 포인트 + 무채색 외 강조색 미사용.
- 검증: `lint`, `test`, `build`, `test:e2e` 통과.
