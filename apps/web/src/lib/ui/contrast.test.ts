import { describe, expect, it } from "vitest";

import { contrastRatio, isContrastSafe } from "./contrast";

const palette = {
  surfacePage: "#f2f5ff",
  surfaceBase: "#f9fbff",
  surfaceRaised: "#ffffff",
  inkStrong: "#1a2747",
  inkDefault: "#223256",
  inkMuted: "#4b5f87",
  inkSubtle: "#5e7095",
  primary700: "#1b45aa",
};

describe("ui contrast guard", () => {
  it("keeps primary text colors above WCAG AA 4.5:1", () => {
    const primaryTextPairs = [
      [palette.inkStrong, palette.surfaceBase],
      [palette.inkDefault, palette.surfaceBase],
      [palette.inkMuted, palette.surfaceBase],
      [palette.inkStrong, palette.surfacePage],
      [palette.inkDefault, palette.surfacePage],
      [palette.inkMuted, palette.surfacePage],
    ] as const;

    primaryTextPairs.forEach(([foreground, background]) => {
      expect(isContrastSafe(foreground, background, 4.5)).toBe(true);
    });
  });

  it("keeps subtle/help text above 4.5:1 on base/page surfaces", () => {
    expect(isContrastSafe(palette.inkSubtle, palette.surfaceBase, 4.5)).toBe(true);
    expect(isContrastSafe(palette.inkSubtle, palette.surfacePage, 4.5)).toBe(true);
  });

  it("keeps primary brand text visible on light surfaces", () => {
    expect(contrastRatio(palette.primary700, palette.surfaceRaised)).toBeGreaterThanOrEqual(7);
  });
});
