/**
 * Project Accent Color from a work page (`#RGB` / `#RRGGBB`). Same contract as
 * the iOS `Palette.named` / `onNamed` helpers — one hex in, a fill plus a
 * contrasting glyph colour out.
 */

export interface WorkAccent {
  /** Normalised `#RRGGBB`. */
  hex: string;
  /** Black or white glyph colour that contrasts with `hex`. */
  onHex: "#000000" | "#ffffff";
}

const HEX_PATTERN = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/** White glyphs once the fill is mid-dark. Matches iOS (`0.4`, not WCAG 0.179). */
const LIGHT_FOREGROUND_LUMINANCE = 0.4;

export function parseWorkAccent(value?: string | null): WorkAccent | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!HEX_PATTERN.test(trimmed)) {
    return null;
  }
  const hex = expandHex(trimmed);
  return {
    hex,
    onHex: prefersLightForeground(hex) ? "#ffffff" : "#000000",
  };
}

export function workAccentCssVars(
  accent: WorkAccent | null,
  isDark = false,
): Record<`--${string}`, string> | undefined {
  if (!accent) {
    return undefined;
  }
  return {
    "--work-accent": accent.hex,
    "--work-on-accent": accent.onHex,
    "--work-accent-fill": hexToRgba(accent.hex, isDark ? 0.7 : 0.62),
    "--work-accent-fill-hover": hexToRgba(accent.hex, isDark ? 0.84 : 0.78),
  };
}

export function applyWorkAccent(
  root: HTMLElement,
  value: string | null | undefined,
  isDark = false,
): void {
  const accent = parseWorkAccent(value);
  const vars = workAccentCssVars(accent, isDark);
  if (!accent || !vars) {
    delete root.dataset.workAccent;
    root.style.removeProperty("--work-accent");
    root.style.removeProperty("--work-on-accent");
    root.style.removeProperty("--work-accent-fill");
    root.style.removeProperty("--work-accent-fill-hover");
    return;
  }
  root.dataset.workAccent = accent.hex;
  for (const [name, next] of Object.entries(vars)) {
    root.style.setProperty(name, next);
  }
}

function expandHex(value: string): string {
  const digits = value.slice(1);
  if (digits.length === 3) {
    return `#${digits
      .split("")
      .map((digit) => `${digit}${digit}`)
      .join("")}`.toUpperCase();
  }
  return `#${digits}`.toUpperCase();
}

function prefersLightForeground(hex: string): boolean {
  const { r, g, b } = rgbChannels(hex);
  return relativeLuminance(r / 255, g / 255, b / 255) < LIGHT_FOREGROUND_LUMINANCE;
}

function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = rgbChannels(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function rgbChannels(hex: string): { r: number; g: number; b: number } {
  const value = Number.parseInt(hex.slice(1), 16);
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  };
}

function relativeLuminance(red: number, green: number, blue: number): number {
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

function linear(channel: number): number {
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}
