import { createSupabaseServerClient } from "@/lib/supabase/server";

type SessionSourceResult = {
  user: { id: string } | null;
};

type SessionUserSource = () => Promise<SessionSourceResult>;

function readCookieValue(cookieHeader: string, key: string) {
  const keyValuePair = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${key}=`));
  if (!keyValuePair) return undefined;
  return decodeURIComponent(keyValuePair.slice(key.length + 1));
}

export function readBypassUserIdFromRequest(
  request: Request,
  bypassEnabled: boolean
) {
  if (!bypassEnabled) return undefined;
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;
  return readCookieValue(cookieHeader, "e2e-user-id");
}

export async function getSessionUserIdFrom(source: SessionUserSource) {
  const { user } = await source();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user.id;
}

export async function getSessionUserId(request?: Request) {
  const bypassUserId =
    request &&
    readBypassUserIdFromRequest(request, process.env.E2E_AUTH_BYPASS === "1");
  if (bypassUserId) return bypassUserId;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error("UNAUTHORIZED");
  }

  return getSessionUserIdFrom(async () => ({
    user: data.user ? { id: data.user.id } : null,
  }));
}
