# 환경 변수 점검표

배포 전에 아래 항목을 순서대로 확인하면 대부분의 초기 설정 문제를 줄일 수 있습니다.

## 필수 환경 변수
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 공개(anon) 키
- `SUPABASE_SERVICE_ROLE_KEY`: 서버 전용 서비스 키

## 점검 절차
1. 로컬 `apps/web/.env.local`에 필수 변수 3개가 모두 존재하는지 확인합니다.
2. Vercel 프로젝트 환경 변수에도 동일한 3개 값이 등록되어 있는지 확인합니다.
3. 아래 명령으로 테스트를 실행합니다.

```bash
npm --prefix apps/web run test
```

4. 아래 명령으로 빌드가 정상 동작하는지 확인합니다.

```bash
npm --prefix apps/web run build
```

## 자주 발생하는 오류
- `UNAUTHORIZED`: Supabase 세션이 없거나 만료된 상태입니다.
- `FORBIDDEN`: 현재 사용자가 대상 워크스페이스 멤버가 아닙니다.
- `INTERNAL_ERROR`: 요청 본문 형식이 잘못됐거나 필수 환경 변수가 누락되었습니다.
