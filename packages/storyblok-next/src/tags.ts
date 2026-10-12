/**
 * Every tag a cached Storyblok read can carry. `cacheTag()` in readers and
 * `expire*()` in the webhook both go through this map, so a tag string is
 * never typed twice.
 */
export const CMS_TAGS = {
  /** One story, by full slug. */
  story: (slug: string) => `cms:story:${slug}`,
  /** Anything that lists or indexes stories (work list, search, feed, …). */
  stories: "cms:stories",
  /** The site-wide config story (nav, footer, widgets, identity). */
  config: "cms:config",
} as const;
