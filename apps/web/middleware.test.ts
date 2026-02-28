/**
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { AUTH_SESSION_COOKIE_NAME } from "./src/features/auth/constants";
import { isProtectedPath, middleware } from "./middleware";

describe("middleware", () => {
  it("classifies new protected paths", () => {
    expect(isProtectedPath("/orgs")).toBe(true);
    expect(isProtectedPath("/orgs/abc")).toBe(true);
    expect(isProtectedPath("/issues")).toBe(true);
    expect(isProtectedPath("/issues/ISS-1")).toBe(true);
    expect(isProtectedPath("/reports/users/user-1")).toBe(true);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/")).toBe(false);
  });

  it("redirects unauthenticated user to login on protected route", () => {
    const request = new NextRequest("http://localhost/issues");
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("allows request when auth session cookie is present", () => {
    const request = new NextRequest("http://localhost/issues", {
      headers: { cookie: `${AUTH_SESSION_COOKIE_NAME}=session-token` },
    });

    const response = middleware(request);

    expect(response.status).toBe(200);
  });
});
