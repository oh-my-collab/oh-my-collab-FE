# 구독 없는 협업 툴 (Option A)

캡스톤 팀이 월 구독료 없이 사용할 수 있도록 설계한 협업 툴 프로젝트입니다.  
Vercel + Supabase 조합을 기준으로 문서화, 태스크 관리, 목표 추적, 인사이트 기능을 제공합니다.

## 프로젝트 구조
- `apps/web`: Next.js(App Router) 기반 웹 애플리케이션
- `apps/web/supabase/migrations`: DB 스키마 및 인사이트 SQL 마이그레이션
- `docs/deploy`: 배포 및 환경 설정 문서
- `docs/plans`: 기획/설계/구현 계획 문서

## 로컬 실행 방법
1. 의존성 설치
```bash
npm --prefix apps/web install
```

2. 환경 변수 파일 준비
```bash
cp apps/web/.env.example apps/web/.env.local
```

3. 개발 서버 실행
```bash
npm --prefix apps/web run dev
```

## 주요 검증 명령
아래 명령은 기능 수정 후 기본적으로 실행하는 것을 권장합니다.

```bash
npm --prefix apps/web run lint
npm --prefix apps/web run test
npm --prefix apps/web run test:e2e
npm --prefix apps/web run build
```

## Supabase 마이그레이션 순서
1. `apps/web/supabase/migrations/20260219_001_init.sql`
2. `apps/web/supabase/migrations/20260219_002_insights.sql`

## 샘플 데이터 시드
```bash
npm --prefix apps/web run seed
```

## 배포/환경 문서
- 빠른 배포 가이드: `docs/deploy/vercel-supabase-quickstart.md`
- 환경 변수 점검표: `docs/deploy/env-checklist.md`
