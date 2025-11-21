import type { StoryblokAsset } from "./types";

/**
 * Get optimized image URL from Storyblok asset
 */
export function getAssetFromStoryblok(
  asset: StoryblokAsset | string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "jpeg" | "png";
    fit?: "in" | "out";
  },
): string {
  const filename = typeof asset === "string" ? asset : asset.filename;

  if (!filename) {
    return "";
  }

  // If it's not a Storyblok image, return as-is
  if (!filename.includes("a.storyblok.com")) {
    return filename;
  }

  // Build image service URL
  const params: string[] = [];

  if (options?.width) {
    params.push(`${options.width}x${options.height || 0}`);
  }

  if (options?.quality) {
    params.push(`quality(${options.quality})`);
  }

  if (options?.format) {
    params.push(`format(${options.format})`);
  }

  if (options?.fit) {
    params.push(`fit-${options.fit}`);
  }

  if (params.length === 0) {
    return filename;
  }

  // Insert image service params into URL
  return filename.replace("/f/", `/f/${params.join("/")}/`);
}
