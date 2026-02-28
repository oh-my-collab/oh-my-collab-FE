import { cookies } from "next/headers";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const MOCK_SESSION_COOKIE = "mock-user-id";
export const E2E_BYPASS_COOKIE = "e2e-user-id";

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
  const cookieHeader = request.headers.get("cookie");
  return (
    readCookieValue(cookieHeader, MOCK_SESSION_COOKIE) ??
    readCookieValue(cookieHeader, E2E_BYPASS_COOKIE)
  );
}

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function readSessionCookieFromServer() {
  const cookieStore = await cookies();
  return (
    cookieStore.get(MOCK_SESSION_COOKIE)?.value ??
    cookieStore.get(E2E_BYPASS_COOKIE)?.value
  );
}

async function readSupabaseUserId() {
  if (!hasSupabaseEnv()) return null;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.id) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

export async function getOptionalSessionUserId(request?: Request) {
  const bypassEnabled = process.env.E2E_AUTH_BYPASS === "1";

  if (request) {
    const fromRequestCookie = readSessionCookieFromRequest(request);
    if (fromRequestCookie) return fromRequestCookie;
    if (bypassEnabled) return "user-owner";
  } else {
    const fromCookieStore = await readSessionCookieFromServer();
    if (fromCookieStore) return fromCookieStore;
    if (bypassEnabled) return "user-owner";
  }

  return readSupabaseUserId();
}

export async function getSessionUserIdOrThrow(request?: Request) {
  const userId = await getOptionalSessionUserId(request);
  if (!userId) throw new Error("UNAUTHORIZED");
  return userId;
}
