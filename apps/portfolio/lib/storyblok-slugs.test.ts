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
});
