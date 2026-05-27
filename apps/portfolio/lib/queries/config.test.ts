import { beforeEach, vi } from "vitest";

vi.mock("@httpjpg/storyblok-api", () => ({
  getStoryblokApi: vi.fn(),
}));

vi.mock("@httpjpg/storyblok-next", () => ({
  CACHE_TAGS: {
    STORY: (slug: string) => `story-${slug}`,
    STORIES: "stories",
    CONFIG: "storyblok-config",
  },
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock("next/headers", () => ({
  draftMode: vi.fn(),
}));

import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { draftMode } from "next/headers";

import { getConfig, getFooterConfig, getNavigation, getSeoDefaults } from "./config";

const mockGetStoryblokApi = vi.mocked(getStoryblokApi);
const mockDraftMode = vi.mocked(draftMode);

function setupGetStory(impl: (args: unknown) => unknown) {
  mockGetStoryblokApi.mockReturnValue({
    getStory: vi.fn(impl as never),
  } as never);
}

describe("getConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mockDraftMode.mockResolvedValue({ isEnabled: false } as never);
  });

  it("returns the story content from Storyblok", async () => {
    const content = { seo_title: "Title" };
    setupGetStory(async () => ({ content }));
    await expect(getConfig()).resolves.toEqual(content);
  });

  it("requests the config slug with the menu_link.link relation", async () => {
    const getStory = vi.fn(async () => ({ content: {} }));
    mockGetStoryblokApi.mockReturnValue({ getStory } as never);
    await getConfig();
    expect(getStory).toHaveBeenCalledWith({
      slug: "config",
      resolve_relations: ["menu_link.link"],
    });
  });

  it("uses draft mode when enabled", async () => {
    mockDraftMode.mockResolvedValue({ isEnabled: true } as never);
    setupGetStory(async () => ({ content: { draft: true } }));
    await getConfig();
    expect(mockGetStoryblokApi).toHaveBeenCalledWith({ draftMode: true });
  });

  it("returns null when the story has no content", async () => {
    setupGetStory(async () => null);
    await expect(getConfig()).resolves.toBeNull();
  });

  it("returns null and logs when Storyblok throws", async () => {
    setupGetStory(async () => {
      throw new Error("api down");
    });
    await expect(getConfig()).resolves.toBeNull();
    expect(console.error).toHaveBeenCalledWith("Error fetching config:", expect.any(Error));
  });
});

describe("getNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDraftMode.mockResolvedValue({ isEnabled: false } as never);
  });

  it("returns the fallback navigation when no header_menu is configured", async () => {
    setupGetStory(async () => ({ content: { header_menu: [] } }));
    const nav = await getNavigation();
    expect(nav.map((n) => n.name)).toEqual(["Home", "CV", "Feed"]);
    expect(nav.every((n) => n.isExternal === false)).toBe(true);
  });

  it("returns the fallback navigation when the config story is null", async () => {
    setupGetStory(async () => null);
    const nav = await getNavigation();
    expect(nav).toHaveLength(3);
  });

  it("maps configured menu items into nav items", async () => {
    setupGetStory(async () => ({
      content: {
        header_menu: [
          {
            label: "Projects",
            link: { linktype: "story", cached_url: "work" },
            is_external: false,
          },
        ],
      },
    }));
    const nav = await getNavigation();
    expect(nav).toEqual([{ name: "Projects", href: "/work", isExternal: false }]);
  });

  it("drops menu items that have no name or no link", async () => {
    setupGetStory(async () => ({
      content: {
        header_menu: [
          { label: "Good", link: { linktype: "story", cached_url: "about" } },
          { link: { linktype: "story", cached_url: "no-name" } },
          { label: "No Link" },
        ],
      },
    }));
    const nav = await getNavigation();
    expect(nav.map((n) => n.name)).toEqual(["Good"]);
  });

  it("infers isExternal from the href when not explicitly set", async () => {
    setupGetStory(async () => ({
      content: {
        header_menu: [
          {
            label: "External",
            link: { linktype: "url", url: "https://example.com" },
          },
        ],
      },
    }));
    const nav = await getNavigation();
    expect(nav[0]?.isExternal).toBe(true);
  });
});

describe("getFooterConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDraftMode.mockResolvedValue({ isEnabled: false } as never);
  });

  it("returns only the default background image when no footer_config exists", async () => {
    setupGetStory(async () => ({ content: {} }));
    await expect(getFooterConfig()).resolves.toEqual({
      backgroundImage: "https://www.httpjpg.com/images/footer_bg.png",
    });
  });

  it("maps configured footer fields", async () => {
    setupGetStory(async () => ({
      content: {
        footer_config: [
          {
            copyright_text: "© 2026",
            footer_links: [
              { label: "Imprint", link: { linktype: "story", cached_url: "imprint" } },
            ],
            background_image: { filename: "https://cdn/footer.png" },
          },
        ],
      },
    }));
    const footer = await getFooterConfig();
    expect(footer.copyrightText).toBe("© 2026");
    expect(footer.backgroundImage).toBe("https://cdn/footer.png");
    expect(footer.footerLinks).toEqual([{ name: "Imprint", href: "/imprint", isExternal: false }]);
  });
});

describe("getSeoDefaults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDraftMode.mockResolvedValue({ isEnabled: false } as never);
  });

  it("forwards SEO title and description from the config story", async () => {
    setupGetStory(async () => ({
      content: { seo_title: "httpjpg", seo_description: "Brutalist portfolio" },
    }));
    await expect(getSeoDefaults()).resolves.toEqual({
      title: "httpjpg",
      description: "Brutalist portfolio",
    });
  });

  it("returns undefined for missing SEO fields", async () => {
    setupGetStory(async () => ({ content: {} }));
    await expect(getSeoDefaults()).resolves.toEqual({
      title: undefined,
      description: undefined,
    });
  });

  it("returns undefined SEO fields when the config is null", async () => {
    setupGetStory(async () => null);
    await expect(getSeoDefaults()).resolves.toEqual({
      title: undefined,
      description: undefined,
    });
  });
});
