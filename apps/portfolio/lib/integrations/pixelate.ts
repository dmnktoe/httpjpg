import sharp from "sharp";

import { isHttpUrl, readLimited, safeFetch } from "./favicon";

export interface PixelateOptions {
  /** Grid width in pixels: the CSS width the thumb is drawn at, so one cell is one CSS pixel. */
  width: number;
  /** Omit to keep the source's proportions (posters, sleeves, video stills). */
  height?: number;
  /** `contain` keeps a crest or badge whole on a transparent ground; `cover` crops. */
  fit?: "cover" | "contain";
}

const TIMEOUT_MS = 5000;
const MAX_SOURCE_BYTES = 4 * 1024 * 1024;

/**
 * Footer media is drawn as pixel art: the server shrinks each image to a grid
 * of CSS pixels and hands it over as a data: PNG, which every client upscales
 * without smoothing. An image whose host refuses the server is left out (null)
 * rather than sent on for the client to fetch on its own.
 */
export async function pixelateImage(
  source: string | null | undefined,
  { width, height, fit = "cover" }: PixelateOptions,
): Promise<string | null> {
  const target = source ? isHttpUrl(source) : null;
  if (!target) {
    return null;
  }

  try {
    const response = await safeFetch(target, "image/*", Date.now() + TIMEOUT_MS);
    if (!response?.ok) {
      return null;
    }
    const bytes = await readLimited(response, MAX_SOURCE_BYTES);
    if (!bytes) {
      return null;
    }
    const pixels = await sharp(bytes)
      .resize(width, height, {
        fit,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    return `data:image/png;base64,${pixels.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Grid sizes, matched to the `FooterStatusLineThumb` widths that draw them. */
export const PIXEL_GRID = {
  /** `size="3"`: covers, icons, avatars. */
  thumb: 12,
  /** `size="4"`: crests, trophy art, the PSN avatar. */
  large: 16,
} as const;

type ImageKey<T> = { [K in keyof T]: T[K] extends string | null ? K : never }[keyof T];

/** Pixelates one image field across a list, in parallel. */
export function pixelateEach<T, K extends ImageKey<T>>(
  items: T[],
  key: K,
  options: PixelateOptions,
): Promise<T[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      [key]: await pixelateImage(item[key] as string | null, options),
    })),
  );
}
