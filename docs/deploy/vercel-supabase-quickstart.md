# Vercel + Supabase 빠른 배포 가이드

이 문서는 Option A 기준(`Vercel + Supabase`)으로 웹 앱을 빠르게 배포하는 절차를 설명합니다.

## 1. 저장소 포크 및 Vercel 프로젝트 연결
1. 현재 저장소를 본인 계정으로 포크합니다.
2. Vercel 대시보드에서 `Add New -> Project`를 선택합니다.
3. 포크한 저장소를 가져오고, 루트 디렉터리를 `apps/web`으로 지정합니다.

## 2. Vercel 환경 변수 설정
Vercel 프로젝트 설정의 환경 변수 항목에 아래 값을 등록합니다.
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 3. Supabase 스키마 반영
1. Supabase 대시보드에서 SQL Editor를 엽니다.
2. 아래 마이그레이션 파일을 순서대로 실행합니다.
   - `apps/web/supabase/migrations/20260219_001_init.sql`
   - `apps/web/supabase/migrations/20260219_002_insights.sql`

## 4. 배포 실행 및 기본 점검
1. Vercel에서 배포를 실행합니다.
2. 배포 URL에서 `/api/health` 엔드포인트를 호출해 아래 응답을 확인합니다.

```json
{ "status": "ok" }
```

## 5. 워크스페이스 초기화
Supabase 로그인 세션이 있는 상태에서 `POST /api/workspaces`를 호출합니다.

```json
{ "name": "My Capstone Team" }
```

세션 인증 기반이므로, 같은 브라우저 세션 또는 유효한 인증 쿠키를 사용하는 클라이언트에서 호출해야 합니다.
