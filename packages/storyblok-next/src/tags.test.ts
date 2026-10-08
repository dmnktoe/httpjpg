import { CACHE_LIFE } from "./cache-life";
import { CMS_TAGS } from "./tags";

describe("CMS_TAGS", () => {
  it("namespaces every tag under cms:", () => {
    expect(CMS_TAGS.story("home")).toBe("cms:story:home");
    expect(CMS_TAGS.stories).toBe("cms:stories");
    expect(CMS_TAGS.config).toBe("cms:config");
  });
});

describe("CACHE_LIFE", () => {
  it("keeps the cms profile at an hour, expiring after a quiet day", () => {
    expect(CACHE_LIFE.cms).toEqual({ stale: 300, revalidate: 3600, expire: 86_400 });
  });
});
