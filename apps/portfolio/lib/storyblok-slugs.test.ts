import { STORYBLOK_SLUGS } from "./storyblok-slugs";

describe("STORYBLOK_SLUGS", () => {
  it("exposes the config slug", () => {
    expect(STORYBLOK_SLUGS.CONFIG).toBe("config");
  });

  it("exposes the home slug", () => {
    expect(STORYBLOK_SLUGS.HOME).toBe("home");
  });

  it("exposes the work prefix with a trailing slash", () => {
    expect(STORYBLOK_SLUGS.WORK_PREFIX).toBe("work/");
    expect(STORYBLOK_SLUGS.WORK_PREFIX.endsWith("/")).toBe(true);
  });

  it("exposes the feed folder and its prefix", () => {
    expect(STORYBLOK_SLUGS.FEED).toBe("feed");
    expect(STORYBLOK_SLUGS.FEED_PREFIX).toBe("feed/");
  });

  it("exposes the CV slug used for field-level i18n", () => {
    expect(STORYBLOK_SLUGS.CV).toBe("cv");
  });
});
