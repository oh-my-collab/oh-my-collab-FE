import {
  E2E_BYPASS_COOKIE,
  getOptionalSessionUserId,
  getSessionUserIdOrThrow,
  MOCK_SESSION_COOKIE,
} from "@/features/auth/session";

export { E2E_BYPASS_COOKIE, MOCK_SESSION_COOKIE };

function readCookieValue(rawCookie: string | null, name: string) {
  if (!rawCookie) return undefined;
  const token = rawCookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!token) return undefined;
  return decodeURIComponent(token.slice(name.length + 1));
}

export function readBypassUserIdFromRequest(request: Request, bypassEnabled: boolean) {
  if (!bypassEnabled) return undefined;
  const cookieHeader = request.headers.get("cookie");
  return readCookieValue(cookieHeader, E2E_BYPASS_COOKIE);
}

export async function getSessionUserId(request?: Request) {
  return getSessionUserIdOrThrow(request);
}

export async function getSessionUserIdFrom(
  source: () => Promise<{ user: { id: string } | null }>
) {
  const { user } = await source();
  if (!user?.id) throw new Error("UNAUTHORIZED");
  return user.id;
}

export async function getOptionalSessionUser(request?: Request) {
  return getOptionalSessionUserId(request);
}
