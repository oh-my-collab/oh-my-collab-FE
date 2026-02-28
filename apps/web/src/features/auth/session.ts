import { cookies } from "next/headers";

import { AUTH_SESSION_COOKIE_NAME } from "@/features/auth/constants";

function readCookieValue(rawCookie: string | null, name: string) {
  if (!rawCookie) return undefined;
  const token = rawCookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!token) return undefined;
  return decodeURIComponent(token.slice(name.length + 1));
}

export function readSessionCookieFromRequest(request: Request) {
  return readCookieValue(request.headers.get("cookie"), AUTH_SESSION_COOKIE_NAME);
}

async function readSessionCookieFromServer() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value;
}

export async function getOptionalSessionUserId(request?: Request) {
  if (request) {
    return readSessionCookieFromRequest(request);
  }

  return readSessionCookieFromServer();
}

export async function getSessionUserIdOrThrow(request?: Request) {
  const userId = await getOptionalSessionUserId(request);
  if (!userId) throw new Error("UNAUTHORIZED");
  return userId;
}
