import sharp from "sharp";

import { isHttpUrl, readLimited, safeFetch } from "./favicon";

export interface PixelateOptions {
  width: number;
  height?: number;
  fit?: "cover" | "contain";
}

const TIMEOUT_MS = 5000;
const MAX_SOURCE_BYTES = 4 * 1024 * 1024;

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

export const PIXEL_GRID = {
  thumb: 12,
  large: 16,
} as const;

type ImageKey<T> = {
  [K in keyof T]: T[K] extends string | null ? (null extends T[K] ? K : never) : never;
}[keyof T];

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
