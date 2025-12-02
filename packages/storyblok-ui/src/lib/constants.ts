/**
 * Common constants for Storyblok components
 * Centralized values for aspect ratios, widths, and other shared options
 */

/**
 * Supported aspect ratios for images and videos
 */
export const ASPECT_RATIOS = [
  "16/9",
  "4/3",
  "1/1",
  "3/4",
  "9/16",
  "21/9",
] as const;

export type AspectRatio = (typeof ASPECT_RATIOS)[number];

/**
 * Width constraint options
 */
export const WIDTH_OPTIONS = ["full", "container", "narrow"] as const;

export type WidthOption = (typeof WIDTH_OPTIONS)[number];

/**
 * Named spacing sizes
 */
export const SPACING_SIZES = {
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
} as const;

export type SpacingSize = keyof typeof SPACING_SIZES;

/**
 * Maximum widths for container sizes
 */
export const CONTAINER_WIDTHS = {
  narrow: "800px", // Small container (sm)
  container: "1200px", // Default container
  full: "100%", // Full width
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  aspectRatio: "16/9" as AspectRatio,
  width: "full" as WidthOption,
  spacing: "medium" as SpacingSize,
  imageQuality: 75,
  imageFormat: "webp",
} as const;

/**
 * Storyblok image service dimensions
 * Common sizes for different use cases
 */
export const IMAGE_SIZES = {
  thumbnail: "600x400",
  medium: "1200x675",
  large: "2000x1125",
  hero: "2400x1350",
} as const;

export type ImageSize = keyof typeof IMAGE_SIZES;

/**
 * Video source types
 */
export const VIDEO_SOURCES = ["native", "youtube", "vimeo"] as const;

export type VideoSource = (typeof VIDEO_SOURCES)[number];

/**
 * Copyright position options
 */
export const COPYRIGHT_POSITIONS = ["inline", "below", "overlay"] as const;

export type CopyrightPosition = (typeof COPYRIGHT_POSITIONS)[number];
