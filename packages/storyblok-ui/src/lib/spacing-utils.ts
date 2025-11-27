/**
 * Spacing utilities for Storyblok components
 * Converts Storyblok spacing strings to Panda CSS tokens
 */

import type { SystemStyleObject } from "styled-system/types";
import { SPACING_SIZES } from "./constants";

/**
 * Maps common spacing values to Panda CSS tokens
 * Supports px values, rem values, and named tokens
 */
export function getSpacingStyles(
  spacingTop?: string,
  spacingBottom?: string,
): SystemStyleObject {
  const styles: SystemStyleObject = {};

  if (spacingTop) {
    styles.mt = normalizeSpacing(spacingTop);
  }

  if (spacingBottom) {
    styles.mb = normalizeSpacing(spacingBottom);
  }

  return styles;
}

/**
 * Normalizes spacing values to Panda CSS tokens
 * Examples:
 * - "16px" -> "4" (token)
 * - "1rem" -> "4" (token)
 * - "2rem" -> "8" (token)
 * - "small" -> "4"
 * - "medium" -> "8"
 * - "large" -> "16"
 */
function normalizeSpacing(value: string): string | number {
  // Direct pixel values
  const pxMatch = value.match(/^(\d+)px$/);
  if (pxMatch) {
    const px = Number.parseInt(pxMatch[1], 10);
    // Map to closest token: 4px = 1, 8px = 2, 16px = 4, etc.
    if (px <= 4) {
      return "1";
    }
    if (px <= 8) {
      return "2";
    }
    if (px <= 12) {
      return "3";
    }
    if (px <= 16) {
      return "4";
    }
    if (px <= 24) {
      return "6";
    }
    if (px <= 32) {
      return "8";
    }
    if (px <= 48) {
      return "12";
    }
    if (px <= 64) {
      return "16";
    }
    return `${px}px`; // Fallback to original value
  }

  // Direct rem values
  const remMatch = value.match(/^(\d+(?:\.\d+)?)rem$/);
  if (remMatch) {
    const rem = Number.parseFloat(remMatch[1]);
    // Map to closest token: 0.5rem = 2, 1rem = 4, 2rem = 8, etc.
    if (rem <= 0.25) {
      return "1";
    }
    if (rem <= 0.5) {
      return "2";
    }
    if (rem <= 0.75) {
      return "3";
    }
    if (rem <= 1) {
      return "4";
    }
    if (rem <= 1.5) {
      return "6";
    }
    if (rem <= 2) {
      return "8";
    }
    if (rem <= 3) {
      return "12";
    }
    if (rem <= 4) {
      return "16";
    }
    return value; // Fallback to original value
  }

  // Named sizes
  const namedSizes: Record<string, string> = {
    none: "0",
    xs: "2",
    sm: "4",
    small: "4",
    md: "8",
    medium: "8",
    lg: "16",
    large: "16",
    xl: "24",
    "2xl": "32",
  };

  return namedSizes[value.toLowerCase()] || value;
}

/**
 * Gets width constraint styles based on Storyblok width option
 */
export function getWidthStyles(
  width?: "full" | "container" | "narrow",
): SystemStyleObject {
  if (!width || width === "full") {
    return { width: "100%" };
  }

  if (width === "container") {
    return {
      maxWidth: "container",
      mx: "auto",
      px: "4",
    };
  }

  // narrow
  return {
    maxWidth: "container.sm",
    mx: "auto",
    px: "4",
  };
}

/**
 * Combines spacing and width styles for common layout patterns
 */
export function getLayoutStyles(
  spacingTop?: string,
  spacingBottom?: string,
  width?: "full" | "container" | "narrow",
): SystemStyleObject {
  return {
    ...getSpacingStyles(spacingTop, spacingBottom),
    ...getWidthStyles(width),
  };
}

/**
 * Maps Storyblok datasource spacing values to Panda CSS tokens
 * Handles both datasource labels (e.g., "Medium", "Large") and direct token values
 *
 * @example
 * ```ts
 * mapSpacingToToken("Medium") // "8"
 * mapSpacingToToken("Large") // "16"
 * mapSpacingToToken("16") // "16" (passthrough)
 * ```
 */
export function mapSpacingToToken(value?: string | null): string {
  if (!value) return SPACING_SIZES.medium;

  // Direct numeric token value (e.g., "8", "16")
  if (/^\d+$/.test(value)) return value;

  // Named value from datasource (case-insensitive)
  const normalized = value.toLowerCase().replace(/\s+/g, "");

  // Map common datasource labels to tokens
  const labelMap: Record<string, string> = {
    none: SPACING_SIZES.none,
    xs: SPACING_SIZES.xs,
    small: SPACING_SIZES.small,
    medium: SPACING_SIZES.medium,
    large: SPACING_SIZES.large,
    xl: SPACING_SIZES.xl,
    "2xl": SPACING_SIZES["2xl"],
  };

  return labelMap[normalized] || SPACING_SIZES.medium;
}
