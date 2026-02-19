import { describe, expect, it } from "vitest";

import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("throws when required keys are missing", () => {
    expect(() => parseEnv({} as NodeJS.ProcessEnv)).toThrow(
      "NEXT_PUBLIC_SUPABASE_URL"
    );
  });
});
