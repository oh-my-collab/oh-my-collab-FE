import { CONFIG_MISSING_API_BASE_URL } from "@/lib/api/backend-client";

const apiConfigErrorMessage =
  "백엔드 API 주소가 설정되지 않았습니다. NEXT_PUBLIC_API_BASE_URL 환경 변수를 설정해 주세요.";

export function getApiErrorDescription(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === CONFIG_MISSING_API_BASE_URL) {
    return apiConfigErrorMessage;
  }
  return fallback;
}

