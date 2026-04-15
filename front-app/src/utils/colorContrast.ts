/**
 * WCAG 2.1 color contrast utilities.
 *
 * getContrastRatio(hex1, hex2) → contrast ratio (e.g. 4.52)
 * meetsAA(bg, fg)             → true if ratio ≥ 4.5 (normal text)
 * meetsAALarge(bg, fg)        → true if ratio ≥ 3   (large text / UI components)
 * getReadableTextColor(bg)    → "#ffffff" or "#111418" — whichever has higher contrast on bg
 */

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").padEnd(6, "0").slice(0, 6);
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

function toLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AA for normal text (≥4.5:1) */
export function meetsAA(bg: string, fg: string): boolean {
  return getContrastRatio(bg, fg) >= 4.5;
}

/** WCAG AA for large text / UI components (≥3:1) */
export function meetsAALarge(bg: string, fg: string): boolean {
  return getContrastRatio(bg, fg) >= 3;
}

/**
 * Returns the accessible text color (#ffffff or #111418) that provides the
 * highest contrast against the given background hex.
 */
export function getReadableTextColor(bg: string): "#ffffff" | "#111418" {
  const onWhite = getContrastRatio(bg, "#ffffff");
  const onDark = getContrastRatio(bg, "#111418");
  return onDark >= onWhite ? "#111418" : "#ffffff";
}
