import { describe, expect, it } from "vitest";

import { shouldUseInMemoryStore } from "./store-provider";

describe("shouldUseInMemoryStore", () => {
  it("allows in-memory fallback in development when supabase env is missing", () => {
    expect(
      shouldUseInMemoryStore({
        nodeEnv: "development",
        hasSupabaseEnv: false,
      })
    ).toBe(true);
  });

  it("disallows in-memory fallback in production when supabase env is missing", () => {
    expect(
      shouldUseInMemoryStore({
        nodeEnv: "production",
        hasSupabaseEnv: false,
      })
    ).toBe(false);
  });

  it("uses supabase store when env exists regardless of node env", () => {
    expect(
      shouldUseInMemoryStore({
        nodeEnv: "production",
        hasSupabaseEnv: true,
      })
    ).toBe(false);
    expect(
      shouldUseInMemoryStore({
        nodeEnv: "test",
        hasSupabaseEnv: true,
      })
    ).toBe(false);
  });
});
