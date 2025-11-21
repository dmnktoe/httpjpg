import { env } from "@httpjpg/env";

/**
 * Get slug with main folder prefix
 */
export function getSlugWithAppName(options: { slug: string }): string {
  const mainFolder = env.NEXT_PUBLIC_STORYBLOK_MAIN_FOLDER;
  const { slug } = options;

  if (!slug || slug === "/") {
    return mainFolder;
  }

  return `${mainFolder}/${slug}`;
}

/**
 * Get slug without main folder prefix
 */
export function getSlugWithoutAppName(fullSlug: string): string {
  const mainFolder = env.NEXT_PUBLIC_STORYBLOK_MAIN_FOLDER;

  if (fullSlug.startsWith(`${mainFolder}/`)) {
    return fullSlug.replace(`${mainFolder}/`, "");
  }

  if (fullSlug === mainFolder) {
    return "/";
  }

  return fullSlug;
}

/**
 * Check if slug should be excluded from routing
 */
export function isSlugExcludedFromRouting(slug: string): boolean {
  // Exclude config folders, components, etc.
  const excludedPatterns = ["_config", "_components", "_layouts"];
  return excludedPatterns.some((pattern) => slug.includes(pattern));
}
