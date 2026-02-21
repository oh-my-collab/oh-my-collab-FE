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

  it("classifies protected paths", () => {
    expect(isProtectedPath("/tasks")).toBe(true);
    expect(isProtectedPath("/tasks/abc")).toBe(true);
    expect(isProtectedPath("/overview")).toBe(true);
    expect(isProtectedPath("/overview/today")).toBe(true);
    expect(isProtectedPath("/deadlines")).toBe(true);
    expect(isProtectedPath("/deadlines/week")).toBe(true);
    expect(isProtectedPath("/team")).toBe(true);
    expect(isProtectedPath("/team/roles")).toBe(true);
    expect(isProtectedPath("/goals")).toBe(true);
    expect(isProtectedPath("/docs/doc-1")).toBe(true);
    expect(isProtectedPath("/insights")).toBe(true);
    expect(isProtectedPath("/admin/settings")).toBe(true);
    expect(isProtectedPath("/setup")).toBe(false);
    expect(isProtectedPath("/api/tasks")).toBe(false);
  });

  it("redirects unauthenticated user to setup on protected route", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    });

    const request = new NextRequest("http://localhost/tasks");
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/setup");
  });

  it("allows authenticated access on protected route", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
        }),
      },
    });

    const request = new NextRequest("http://localhost/tasks");
    const response = await middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
