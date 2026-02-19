import { describe, expect, it } from "vitest";

import { requireUser } from "./require-user";

describe("requireUser", () => {
  it("throws when user is null", async () => {
    await expect(
      requireUser(async () => ({ user: null }))
    ).rejects.toThrow("UNAUTHORIZED");
  });
});
