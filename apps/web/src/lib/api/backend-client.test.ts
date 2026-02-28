import { afterEach, describe, expect, it, vi } from "vitest";

import { backendClient, CONFIG_MISSING_API_BASE_URL } from "./backend-client";

describe("backend-client", () => {
  const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase;
    vi.restoreAllMocks();
  });

  it("throws when NEXT_PUBLIC_API_BASE_URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;

    expect(() => backendClient.getSession()).toThrow(CONFIG_MISSING_API_BASE_URL);
  });

  it("falls back to HTTP status message when error response is non-json", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:4000";

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Internal Error", {
        status: 500,
      })
    );

    await expect(backendClient.getSession()).rejects.toThrow("Internal Error");
  });
});
