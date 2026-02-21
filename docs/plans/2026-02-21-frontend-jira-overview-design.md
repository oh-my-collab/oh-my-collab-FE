# 프론트 개편 설계서: 약어 제거 + 관리자 접근 복구 + Jira형 UX 확장

## 1. 배경
- 현재 사이드바 접힘 상태에서 영문 약어 표기가 혼합되어 가독성이 낮다.
- 관리자 메뉴 노출 기준이 워크스페이스 문맥과 분리되어 접근 실패 경험이 발생한다.
- 팀 실행 데이터를 한 화면에서 파악할 요약 허브와 데드라인 집중 화면이 부족하다.

## 2. 목표
- 사이드바 영문 약어를 제거하고 접근성 중심 토글로 재구성한다.
- 관리자 접근 문맥을 현재 워크스페이스 권한 기준으로 일치시킨다.
- Jira형 실행 흐름(백로그/스프린트/블로커/마감)을 지원한다.
- `/overview`를 기본 진입으로 전환해 팀 현황을 즉시 파악하게 한다.

## 3. 범위
- 포함
  - 레이아웃: `app-shell`, `sidebar`, `command-palette`
  - 업무 라우트: `/overview`, `/deadlines`, `/tasks`, `/team`
  - API/데이터: `tasks` 필드 확장, reorder API, workspace-members API
  - 테스트: 단위 + E2E 시나리오 확장
- 제외
  - 초대/수락(Invitation)
  - 자동 인사평점 확정
  - 외부 HRIS 연동

## 4. 데이터/API 변경
- `tasks` 확장: `sprint_key`, `is_blocked`, `blocked_reason`, `sort_order`
- `POST /api/tasks`, `PATCH /api/tasks/[taskId]` 입력 확장
- `PATCH /api/tasks/reorder` 신규
- `GET /api/workspace-members` 신규

## 5. UX 원칙
- 브랜드명 `oh-my-collab`만 영문 유지
- 사이드바 접힘 상태는 아이콘 + 툴팁으로 표현
- 관리자 기능은 owner/admin만 변경 가능
- 멤버도 `/overview`, `/deadlines`, `/team`을 통해 운영 상태를 확인 가능

## 6. 검증 기준
- lint/test/build/e2e 통과
- 약어 제거, 관리자 접근, 데드라인/요약 표시, 역할 변경 권한 제한 시나리오 확인

## 7. 커밋 전략
1. docs: 설계 문서
2. feat: 사이드바/토글
3. feat: 작업 모델/API 확장
4. feat: overview/deadlines
5. feat: tasks Jira형 UX
6. feat: team 역할 관리 + 관리자 접근
7. test: 단위/E2E
8. docs: PR 본문 및 운영 문서 보강
