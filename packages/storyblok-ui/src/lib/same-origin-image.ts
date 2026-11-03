/** Widths Next's image optimizer accepts by default (`images.deviceSizes`). */
const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840] as const;

/**
 * Route an image through Next's optimizer so it is served same-origin. The
 * Storyblok CDN sends no CORS headers, so a WebGL texture (or anything that
 * reads pixels) has to come from here instead of `a.storyblok.com`.
 */
export function sameOriginImageUrl(src: string, width = 1200, quality = 80): string {
  const w = DEVICE_SIZES.find((size) => size >= width) ?? DEVICE_SIZES[DEVICE_SIZES.length - 1];
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${quality}`;
}
