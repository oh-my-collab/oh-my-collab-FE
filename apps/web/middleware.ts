import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTE_PREFIXES = [
  "/overview",
  "/deadlines",
  "/team",
  "/tasks",
  "/goals",
  "/docs",
  "/insights",
  "/admin",
] as const;

export function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const setupUrl = request.nextUrl.clone();
    setupUrl.pathname = "/setup";
    setupUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(setupUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/overview/:path*",
    "/deadlines/:path*",
    "/team/:path*",
    "/tasks/:path*",
    "/goals/:path*",
    "/docs/:path*",
    "/insights/:path*",
    "/admin/:path*",
  ],
};
