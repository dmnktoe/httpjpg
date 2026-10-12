export const CMS_TAGS = {
  story: (slug: string) => `cms:story:${slug}`,
  /** Lists and indexes of stories. */
  stories: "cms:stories",
  config: "cms:config",
} as const;
