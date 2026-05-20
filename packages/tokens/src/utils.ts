/**
 * Token utility functions
 * Helper functions for working with design tokens
 */

import { colors } from "./colors";
import { spacing } from "./spacing";

/**
 * Get spacing token value
 * @param key - Spacing token key
 * @returns Spacing value in rem
 */
export function getSpacing(key: keyof typeof spacing): string {
  return spacing[key];
}

/**
 * Get color token value
 * @param path - Color token path (e.g., "neutral.500", "primary.600")
 * @returns Color hex value
 */
export function getColor(path: string): string {
  const parts = path.split(".");
  let value: unknown = colors;

  for (const part of parts) {
    if (typeof value === "object" && value !== null && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return path; // Fallback to original path if not found
    }
  }

  return typeof value === "string" ? value : path;
}

/**
 * Convert px to rem
 * @param px - Pixel value
 * @param base - Base font size (default: 16)
 * @returns rem value
 */
export function pxToRem(px: number, base = 16): string {
  return `${px / base}rem`;
}

/**
 * Convert rem to px
 * @param rem - rem value
 * @param base - Base font size (default: 16)
 * @returns Pixel value
 */
export function remToPx(rem: number, base = 16): number {
  return rem * base;
}

/**
 * Clamp value between min and max
 * Useful for responsive typography and spacing
 * @param min - Minimum value (px or rem)
 * @param preferred - Preferred value (typically vw unit)
 * @param max - Maximum value (px or rem)
 * @returns CSS clamp function string
 */
export function clamp(min: string, preferred: string, max: string): string {
  return `clamp(${min}, ${preferred}, ${max})`;
}

/**
 * Get responsive spacing that scales with viewport
 * @param minKey - Minimum spacing token key
 * @param maxKey - Maximum spacing token key
 * @param vwScale - Viewport width scale (default: 2vw)
 * @returns CSS clamp function string
 */
export function responsiveSpacing(
  minKey: keyof typeof spacing,
  maxKey: keyof typeof spacing,
  vwScale = "2vw",
): string {
  return clamp(getSpacing(minKey), vwScale, getSpacing(maxKey));
}
