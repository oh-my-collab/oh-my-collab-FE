# oh-my-collab Frontend

이 저장소는 Next.js 기반 **프론트엔드 전용** 애플리케이션입니다.
백엔드는 별도 Nest 저장소에서 운영하며, 프론트는 환경변수로 지정한 API만 호출합니다.

## 구조
- `apps/web`: Next.js(App Router) 프론트엔드
- `docs/plans`: 구현/전환 계획 문서

## 실행
1. 의존성 설치
```bash
npm --prefix apps/web install
```

2. 환경변수 설정
```bash
cp apps/web/.env.example apps/web/.env.local
```

3. 개발 서버 실행
```bash
npm --prefix apps/web run dev
```

## 필수 환경변수
- `NEXT_PUBLIC_API_BASE_URL`: Nest API Base URL

예시:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

## 검증 명령
```bash
npm --prefix apps/web run lint
npm --prefix apps/web run test
npm --prefix apps/web run test:e2e
npm --prefix apps/web run build
```

## 동작 참고
- `NEXT_PUBLIC_API_BASE_URL`이 설정되지 않으면 데이터 요청 시 설정 안내 에러가 표시됩니다.
- E2E 테스트는 네트워크 모킹을 사용하므로 백엔드 서버 없이 실행 가능합니다.
