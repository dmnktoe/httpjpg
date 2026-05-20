import { getProcessedImage } from "./image-processing";

/**
 * Canonical Storyblok image transformations used across the app.
 *
 * Centralising these keeps OG meta dimensions, thumbnail sizes, and the
 * blur-placeholder shape consistent everywhere instead of scattered
 * magic strings like `${filename}/m/1200x630/smart`.
 */
export const imagePreset = {
  /** 1200×630 smart-cropped for Open Graph / Twitter card images. */
  og: (filename: string | undefined, focus?: string): string =>
    filename ? getProcessedImage(filename, "1200x630/smart", focus ?? "", "") : "",
  /** 200px wide thumbnail, height auto. Used in nav previews. */
  thumb: (filename: string | undefined, focus?: string): string =>
    filename ? getProcessedImage(filename, "200x0", focus ?? "", "") : "",
  /** 20px wide low-res placeholder for blur-on-load. */
  blur: (filename: string | undefined, focus?: string): string =>
    filename ? getProcessedImage(filename, "20x0", focus ?? "", "") : "",
};
