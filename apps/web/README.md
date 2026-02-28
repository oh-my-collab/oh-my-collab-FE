# Web Frontend

Next.js(App Router) 기반 프론트엔드 애플리케이션입니다.

## 개발 실행
```bash
npm install
npm run dev
```

## 환경변수
`.env.local`에 아래 값을 설정합니다.

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

## 테스트/빌드
```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

## 참고
- 백엔드 API 계약은 `src/lib/api/endpoints.ts`에서 중앙 관리합니다.
- E2E는 Playwright route 모킹으로 백엔드 없이 검증합니다.
