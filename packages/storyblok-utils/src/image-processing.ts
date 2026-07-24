const STORYBLOK_CDN_HTTPS = "https://a.storyblok.com/";
const STORYBLOK_CDN_PROTOCOL_RELATIVE = "//a.storyblok.com/";

function isStoryblokAsset(src: string): boolean {
  return src.startsWith(STORYBLOK_CDN_HTTPS) || src.startsWith(STORYBLOK_CDN_PROTOCOL_RELATIVE);
}

/** External URLs pass through unchanged; Storyblok URLs route through the image service. */
export function getProcessedImage(imageSrc = "", crop = "", focus = "", filters = ""): string {
  if (!imageSrc) {
    return "";
  }

  if (!isStoryblokAsset(imageSrc)) {
    return imageSrc;
  }

  const [width, height] = crop.split("/")[0].split("x");

  let params = "/m";
  let imageFilters = "/filters:quality(75)";

  if (crop) {
    params += `/${crop}`;
    if (focus) {
      const [focalX, focalY] = focus.split(":")[0].split("x");
      imageFilters += `:focal(${focalX}x${focalY}:${width}x${height})`;
    }
  }

  if (filters) {
    imageFilters += `:${filters}`;
  }

  return `${imageSrc}${params}${imageFilters}`;
}

const DEFAULT_RESPONSIVE_WIDTHS = [640, 960, 1280, 1920, 2560];

export interface ResponsiveImageOptions {
  widths?: number[];
  aspectRatio?: string;
  focus?: string;
  filters?: string;
}

export interface ResponsiveImage {
  src: string;
  srcSet: string;
}

/** Returns `{ src, srcSet: "" }` for external URLs — the image service is Storyblok-only. */
export function getResponsiveImage(
  imageSrc = "",
  options: ResponsiveImageOptions = {},
): ResponsiveImage {
  if (!imageSrc) {
    return { src: "", srcSet: "" };
  }
  if (!isStoryblokAsset(imageSrc)) {
    return { src: imageSrc, srcSet: "" };
  }

  const widths = options.widths ?? DEFAULT_RESPONSIVE_WIDTHS;
  const ratio = parseAspectRatio(options.aspectRatio);

  const entries = widths.map((w) => {
    const h = ratio ? Math.round(w / ratio) : 0;
    const url = getProcessedImage(imageSrc, `${w}x${h}`, options.focus, options.filters);
    return `${url} ${w}w`;
  });

  const largest = widths[widths.length - 1];
  const h = ratio ? Math.round(largest / ratio) : 0;
  const src = getProcessedImage(imageSrc, `${largest}x${h}`, options.focus, options.filters);

  return { src, srcSet: entries.join(", ") };
}

function parseAspectRatio(value?: string): number | null {
  if (!value || value === "auto") {
    return null;
  }
  const [w, h] = value.split("/").map(Number);
  if (!w || !h) {
    return null;
  }
  return w / h;
}
