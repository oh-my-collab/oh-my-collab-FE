# 프론트 전용 전환 (Nest 백엔드 분리)

작성일: 2026-02-28

## 배경
기존 레포에는 Next API/Supabase 마이그레이션/시드 코드가 혼재되어 있었고,
운영 구조는 프론트와 Nest 백엔드를 분리하는 방향으로 확정되었습니다.

## 적용 사항
- Next 서버 라우트 제거: `apps/web/src/app/api/**`
- Supabase 관련 코드 제거
  - `apps/web/src/lib/supabase/**`
  - `apps/web/supabase/**`
  - `apps/web/scripts/seed.ts`
- 런타임 mock 데이터 제거
  - `mock-seed`, `mock-store`
- API 클라이언트 교체
  - `src/lib/api/backend-client.ts`
  - `src/lib/api/endpoints.ts`
- 인증 전환
  - 로그인 페이로드: `email`, `password`
  - middleware: `auth_session` 쿠키 존재 기반 보호
- 테스트 전략 전환
  - Playwright route 모킹 기반 E2E
- 문서/환경 정리
  - `.env.example` -> `NEXT_PUBLIC_API_BASE_URL`
  - Supabase 배포 문서 제거

## 운영 가이드
- 필수 환경변수: `NEXT_PUBLIC_API_BASE_URL`
- API 경로 변경 필요 시: `src/lib/api/endpoints.ts`만 수정
- 백엔드 미설정 시: 화면에서 설정 안내 에러 표시

## 검증
- `npm --prefix apps/web run lint`
- `npm --prefix apps/web run test`
- `npm --prefix apps/web run test:e2e`
- `npm --prefix apps/web run build`
