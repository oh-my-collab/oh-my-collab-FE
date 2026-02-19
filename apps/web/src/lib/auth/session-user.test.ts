import { describe, expect, it } from "vitest";

import { getSessionUserIdFrom, readBypassUserIdFromRequest } from "./session-user";

describe("getSessionUserIdFrom", () => {
  it("throws UNAUTHORIZED when session user is missing", async () => {
    await expect(
      getSessionUserIdFrom(async () => ({ user: null }))
    ).rejects.toThrow("UNAUTHORIZED");
  });

  it("returns session user id", async () => {
    await expect(
      getSessionUserIdFrom(async () => ({ user: { id: "user-1" } }))
    ).resolves.toBe("user-1");
  });

  it("reads bypass user id from cookie when bypass enabled", () => {
    const request = new Request("http://localhost", {
      headers: {
        cookie: "foo=bar; e2e-user-id=test-user; hello=world",
      },
    });

    expect(readBypassUserIdFromRequest(request, true)).toBe("test-user");
    expect(readBypassUserIdFromRequest(request, false)).toBeUndefined();
  });
});
