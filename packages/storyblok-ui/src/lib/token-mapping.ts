/**
 * Color mapping utilities for Storyblok components
 * Maps Storyblok datasource color values to CSS custom properties
 */

/**
 * Maps Storyblok datasource color values to CSS color values
 * Converts Panda token references to CSS custom properties for runtime use
 *
 * @example
 * ```ts
 * mapColorToToken("accent.500") // "var(--colors-accent-500)"
 * mapColorToToken("black") // "var(--colors-black)"
 * mapColorToToken("#FF0000") // "#FF0000" (passthrough)
 * ```
 */
export function mapColorToToken(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  // CSS color value (e.g., "#FF0000", "rgb(255, 0, 0)") - pass through
  if (value.startsWith("#") || value.startsWith("rgb")) {
    return value;
  }

  // Already a CSS custom property - pass through
  if (value.startsWith("var(--")) {
    return value;
  }

  // Convert token path to CSS custom property
  // "accent.500" → "var(--colors-accent-500)"
  // "black" → "var(--colors-black)"
  // "neutral.100" → "var(--colors-neutral-100)"
  const cssVarName = value.includes(".")
    ? `--colors-${value.replace(".", "-")}`
    : `--colors-${value}`;

  return `var(${cssVarName})`;
}

/**
 * Maps Storyblok aspect ratio strings to CSS aspect-ratio values
 *
 * @example
 * ```ts
 * mapAspectRatioToToken("16/9") // "16/9"
 * mapAspectRatioToToken("16:9 (Landscape)") // "16/9"
 * ```
 */
export function mapAspectRatioToToken(
  value?: string | null,
): string | undefined {
  if (!value) return undefined;

  // Direct aspect ratio value (e.g., "16/9")
  if (/^\d+\/\d+$/.test(value)) return value;

  // Extract ratio from labeled value (e.g., "16:9 (Landscape)")
  const match = value.match(/(\d+)[:/](\d+)/);
  if (match) {
    return `${match[1]}/${match[2]}`;
  }

  return undefined;
}

/**
 * Maps Storyblok width options to Panda CSS width values
 *
 * @example
 * ```ts
 * mapWidthToToken("Full Width") // "full"
 * mapWidthToToken("container") // "container"
 * ```
 */
export function mapWidthToToken(
  value?: string | null,
): "full" | "container" | "narrow" | undefined {
  if (!value) {
    return undefined;
  }

  // Direct value
  if (value === "full" || value === "container" || value === "narrow") {
    return value;
  }

  // Labeled value from datasource (case-insensitive)
  const normalized = value.toLowerCase().replace(/\s+/g, "");

  const widthMap: Record<string, "full" | "container" | "narrow"> = {
    fullwidth: "full",
    full: "full",
    container: "container",
    narrow: "narrow",
  };

  return widthMap[normalized];
}

/**
 * Maps Storyblok grid columns to CSS grid-template-columns
 *
 * @example
 * ```ts
 * mapGridColumnsToToken("2 Columns") // "2"
 * mapGridColumnsToToken("Auto Fit") // "auto-fit"
 * ```
 */
export function mapGridColumnsToToken(value?: string | null): string {
  if (!value) {
    return "1";
  }

  // Direct numeric value
  if (/^\d+$/.test(value)) {
    return value;
  }

  // Auto-fit pattern
  if (value.toLowerCase().includes("auto")) {
    return "auto-fit";
  }

  // Extract number from labeled value (e.g., "2 Columns" → "2")
  const match = value.match(/(\d+)/);
  if (match) {
    return match[1];
  }

  return "1";
}

/**
 * Maps Storyblok font family to Panda CSS font tokens
 *
 * @example
 * ```ts
 * mapFontFamilyToToken("Sans (Body)") // "sans"
 * mapFontFamilyToToken("headline") // "headline"
 * ```
 */
export function mapFontFamilyToToken(
  value?: string | null,
): string | undefined {
  if (!value) {
    return undefined;
  }

  // Direct token value
  if (["sans", "headline", "accent", "mono"].includes(value)) {
    return value;
  }

  // Labeled value (case-insensitive)
  const normalized = value.toLowerCase();

  if (normalized.includes("sans") || normalized.includes("body")) {
    return "sans";
  }
  if (normalized.includes("headline") || normalized.includes("impact")) {
    return "headline";
  }
  if (normalized.includes("accent") || normalized.includes("script")) {
    return "accent";
  }
  if (normalized.includes("mono") || normalized.includes("code")) {
    return "mono";
  }

  return undefined;
}

/**
 * Maps Storyblok font size to Panda CSS font size tokens
 *
 * @example
 * ```ts
 * mapFontSizeToToken("Small (12px)") // "sm"
 * mapFontSizeToToken("base") // "base"
 * ```
 */
export function mapFontSizeToToken(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  // Direct token value
  if (["sm", "md", "base", "lg", "xl"].includes(value)) {
    return value;
  }

  // Labeled value
  const normalized = value.toLowerCase();

  const sizeMap: Record<string, string> = {
    small: "sm",
    medium: "md",
    base: "base",
    large: "lg",
    xl: "xl",
  };

  for (const [key, token] of Object.entries(sizeMap)) {
    if (normalized.includes(key)) {
      return token;
    }
  }

  return undefined;
}

/**
 * Maps Storyblok font weight to Panda CSS font weight tokens
 *
 * @example
 * ```ts
 * mapFontWeightToToken("Bold (700)") // "bold"
 * mapFontWeightToToken("normal") // "normal"
 * ```
 */
export function mapFontWeightToToken(
  value?: string | null,
): string | undefined {
  if (!value) {
    return undefined;
  }

  // Direct token value
  const weights = [
    "thin",
    "extralight",
    "light",
    "normal",
    "medium",
    "semibold",
    "bold",
    "extrabold",
    "black",
  ];
  if (weights.includes(value)) {
    return value;
  }

  // Labeled value
  const normalized = value.toLowerCase().replace(/\s+/g, "");

  const weightMap: Record<string, string> = {
    light: "light",
    normal: "normal",
    regular: "normal",
    medium: "medium",
    semibold: "semibold",
    bold: "bold",
    black: "black",
  };

  for (const [key, token] of Object.entries(weightMap)) {
    if (normalized.includes(key)) {
      return token;
    }
  }

  return undefined;
}

/**
 * Maps Storyblok animation duration to CSS transition duration
 *
 * @example
 * ```ts
 * mapAnimationDurationToToken("Fast (150ms)") // "150ms"
 * mapAnimationDurationToToken("normal") // "300ms"
 * ```
 */
export function mapAnimationDurationToToken(
  value?: string | null,
): string | undefined {
  if (!value) {
    return undefined;
  }

  // Direct CSS value (e.g., "150ms", "0.3s")
  if (/^\d+m?s$/.test(value)) {
    return value;
  }

  // Named value
  const normalized = value.toLowerCase();

  const durationMap: Record<string, string> = {
    instant: "0ms",
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
    slower: "1000ms",
    veryslow: "1000ms",
  };

  for (const [key, duration] of Object.entries(durationMap)) {
    if (normalized.includes(key)) {
      return duration;
    }
  }

  return undefined;
}

/**
 * Maps Storyblok animation easing to CSS easing function
 *
 * @example
 * ```ts
 * mapAnimationEasingToToken("Ease Out") // "ease-out"
 * mapAnimationEasingToToken("linear") // "linear"
 * ```
 */
export function mapAnimationEasingToToken(
  value?: string | null,
): string | undefined {
  if (!value) {
    return undefined;
  }

  // Direct CSS value
  const easings = ["linear", "ease", "ease-in", "ease-out", "ease-in-out"];
  if (easings.includes(value)) {
    return value;
  }

  // Labeled value
  const normalized = value.toLowerCase().replace(/\s+/g, "");

  const easingMap: Record<string, string> = {
    linear: "linear",
    ease: "ease",
    easein: "ease-in",
    easeout: "ease-out",
    easeinout: "ease-in-out",
  };

  return easingMap[normalized];
}
