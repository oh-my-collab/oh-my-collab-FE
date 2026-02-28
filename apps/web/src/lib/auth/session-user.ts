import { AUTH_SESSION_COOKIE_NAME } from "@/features/auth/constants";
import { getOptionalSessionUserId, getSessionUserIdOrThrow } from "@/features/auth/session";

export { AUTH_SESSION_COOKIE_NAME };

function readCookieValue(rawCookie: string | null, name: string) {
  if (!rawCookie) return undefined;
  const token = rawCookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!token) return undefined;
  return decodeURIComponent(token.slice(name.length + 1));
}

export function readSessionUserIdFromRequest(request: Request) {
  return readCookieValue(request.headers.get("cookie"), AUTH_SESSION_COOKIE_NAME);
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
