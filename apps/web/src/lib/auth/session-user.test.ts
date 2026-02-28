import { describe, expect, it } from "vitest";

import { getSessionUserIdFrom, readSessionUserIdFromRequest } from "./session-user";

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

  it("reads session user id from auth cookie", () => {
    const request = new Request("http://localhost", {
      headers: {
        cookie: "foo=bar; auth_session=test-user; hello=world",
      },
    });

    expect(readSessionUserIdFromRequest(request)).toBe("test-user");
  });
});
