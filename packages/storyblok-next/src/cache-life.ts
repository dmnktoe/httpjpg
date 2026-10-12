/**
 * Named `cacheLife` profiles, registered once in `next.config.ts`:
 *
 * ```ts
 * cacheLife: CACHE_LIFE
 * ```
 *
 * Kept free of runtime imports so the config can load it without pulling in
 * `next/cache` or the Storyblok client.
 */
export const CACHE_LIFE = {
  /**
   * Storyblok content. An hour is the ceiling, not the expected age: the
   * publish webhook expires the matching `CMS_TAGS` long before that.
   */
  cms: {
    stale: 300,
    revalidate: 3600,
    expire: 86_400,
  },
} as const;
