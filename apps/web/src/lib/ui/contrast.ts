type Rgb = { r: number; g: number; b: number };

function normalizeHex(hex: string) {
  const trimmed = hex.trim();
  if (!trimmed.startsWith("#")) {
    throw new Error("INVALID_HEX_COLOR");
  }

  const raw = trimmed.slice(1);
  if (raw.length === 3) {
    return raw
      .split("")
      .map((char) => `${char}${char}`)
      .join("")
      .toLowerCase();
  }

  if (raw.length !== 6) {
    throw new Error("INVALID_HEX_COLOR");
  }

  return raw.toLowerCase();
}

export function hexToRgb(hex: string): Rgb {
  const normalized = normalizeHex(hex);
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function toLinear(value: number) {
  const channel = value / 255;
  if (channel <= 0.03928) return channel / 12.92;
  return ((channel + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(foregroundHex: string, backgroundHex: string) {
  const fg = relativeLuminance(foregroundHex);
  const bg = relativeLuminance(backgroundHex);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

export function isContrastSafe(
  foregroundHex: string,
  backgroundHex: string,
  minimumRatio: number
) {
  return contrastRatio(foregroundHex, backgroundHex) >= minimumRatio;
}
