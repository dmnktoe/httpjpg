/**
 * Central place for Storyblok relations to resolve
 * Used in page files to fetch related content
 */
export const STORYBLOK_RELATIONS = {
  WORK_LIST: "work_list.work",
} as const;

/**
 * All relations as array for API calls
 */
export const resolveRelations = Object.values(STORYBLOK_RELATIONS);

/**
 * Resolve work relations helper
 * Re-exported from storyblok-ui for convenience
 */
export { resolveWorkRelations } from "@httpjpg/storyblok-ui";
