/** `cacheLife` profiles for `next.config.ts`. No runtime imports: the config loads it. */
export const CACHE_LIFE = {
  /** Storyblok content; the publish webhook usually expires it long before the hour. */
  cms: {
    stale: 300,
    revalidate: 3600,
    expire: 86_400,
  },
} as const;
