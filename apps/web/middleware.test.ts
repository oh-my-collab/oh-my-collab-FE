/**
 * @vitest-environment node
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { isProtectedPath, middleware } from "./middleware";

const createServerClientMock = vi.hoisted(() => vi.fn());

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("classifies new protected paths", () => {
    expect(isProtectedPath("/orgs")).toBe(true);
    expect(isProtectedPath("/orgs/abc")).toBe(true);
    expect(isProtectedPath("/issues")).toBe(true);
    expect(isProtectedPath("/issues/ISS-1")).toBe(true);
    expect(isProtectedPath("/reports/users/user-1")).toBe(true);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/api/mock/issues")).toBe(false);
  });

  it("redirects unauthenticated user to login on protected route", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    });

    const request = new NextRequest("http://localhost/issues");
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("allows request with mock cookie", async () => {
    const request = new NextRequest("http://localhost/issues", {
      headers: { cookie: "mock-user-id=user-owner" },
    });

    const response = await middleware(request);

    expect(response.status).toBe(200);
    expect(createServerClientMock).not.toHaveBeenCalled();
  });
});
