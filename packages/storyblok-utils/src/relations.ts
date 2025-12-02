/**
 * Central place for Storyblok relations to resolve
 * Used in page files to fetch related content
 */
export const STORYBLOK_RELATIONS = {
  WORK_LIST: "work-list.work",
} as const;

/**
 * All relations as array for API calls
 */
export const resolveRelations = Object.values(STORYBLOK_RELATIONS);
