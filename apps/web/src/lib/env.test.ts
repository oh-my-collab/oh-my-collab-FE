import { describe, expect, it } from "vitest";

import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("throws when API base URL is missing", () => {
    expect(() => parseEnv({} as NodeJS.ProcessEnv)).toThrow("NEXT_PUBLIC_API_BASE_URL");
  });

  it("accepts valid API base URL", () => {
    expect(
      parseEnv({ NEXT_PUBLIC_API_BASE_URL: "https://api.example.com" } as NodeJS.ProcessEnv)
    ).toEqual({ NEXT_PUBLIC_API_BASE_URL: "https://api.example.com" });
  });
});
