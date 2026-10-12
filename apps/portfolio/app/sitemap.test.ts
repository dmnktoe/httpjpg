// @vitest-environment node
vi.mock("@httpjpg/env", () => ({
  env: { NEXT_PUBLIC_APP_URL: "https://example.test" },
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getStories } = vi.hoisted(() => ({ getStories: vi.fn() }));

vi.mock("@httpjpg/storyblok-api", () => ({
  getStoryblokApi: () => ({ getStories }),
}));

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

vi.mock("next/server", () => ({ connection: vi.fn(async () => undefined) }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";

import sitemap from "./sitemap";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("sitemap", () => {
  it("maps published stories and prepends the home page", async () => {
    getStories.mockResolvedValueOnce({
      stories: [
        {
          slug: "about",
          full_slug: "about",
          first_published_at: "2024-01-01",
          published_at: "2024-02-01",
          is_startpage: false,
        },
        {
          slug: "project",
          full_slug: "work/project",
          first_published_at: "2024-01-01",
          published_at: null,
          is_startpage: false,
        },
      ],
    });

    const entries = await sitemap();

    expect(entries[0].url).toBe("https://example.test");
    expect(entries.some((e) => e.url === "https://example.test/about")).toBe(true);
    const work = entries.find((e) => e.url === "https://example.test/work/project");
    expect(work?.changeFrequency).toBe("monthly");
  });

  it("filters out folders, excluded slugs, external-only and unpublished stories", async () => {
    getStories.mockResolvedValueOnce({
      stories: [
        {
          slug: "config",
          full_slug: "config",
          first_published_at: "2024-01-01",
          is_startpage: false,
        },
        {
          slug: "folder",
          full_slug: "folder",
          first_published_at: "2024-01-01",
          is_startpage: true,
        },
        { slug: "draft", full_slug: "draft", first_published_at: null, is_startpage: false },
        {
          slug: "ext",
          full_slug: "ext",
          first_published_at: "2024-01-01",
          is_startpage: false,
          content: { external_only: true },
        },
      ],
    });

    const entries = await sitemap();
    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe("https://example.test");
  });

  it("falls back to a minimal sitemap and reports on error", async () => {
    getStories.mockRejectedValueOnce(new Error("down"));

    const entries = await sitemap();

    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe("https://example.test");
    expect(captureServerException).toHaveBeenCalledOnce();
  });

  it("treats an empty Storyblok answer as a failure instead of caching it", async () => {
    getStories.mockResolvedValueOnce({ stories: [] });

    const entries = await sitemap();

    expect(entries).toEqual([
      { url: "https://example.test", changeFrequency: "weekly", priority: 1 },
    ]);
    expect(captureServerException).toHaveBeenCalledOnce();
  });

  it("lists both CV locales with hreflang alternates", async () => {
    getStories.mockResolvedValueOnce({
      stories: [
        {
          slug: "cv",
          full_slug: "cv",
          first_published_at: "2024-01-01",
          published_at: "2024-02-01",
          is_startpage: false,
        },
      ],
    });

    const entries = await sitemap();
    const en = entries.find((entry) => entry.url === "https://example.test/cv");
    const de = entries.find((entry) => entry.url === "https://example.test/de/cv");

    expect(en).toBeDefined();
    expect(de).toBeDefined();
    expect(en?.alternates?.languages).toEqual({
      en: "https://example.test/cv",
      de: "https://example.test/de/cv",
      "x-default": "https://example.test/cv",
    });
    expect(de?.alternates?.languages).toEqual(en?.alternates?.languages);
  });

  it("lists the home story once, at the root", async () => {
    getStories.mockResolvedValueOnce({
      stories: [
        {
          slug: "home",
          full_slug: "home",
          first_published_at: "2024-01-01",
          published_at: "2024-03-01",
          is_startpage: false,
        },
      ],
    });

    const entries = await sitemap();

    expect(entries.map((e) => e.url)).toEqual(["https://example.test"]);
    expect(entries[0].lastModified).toEqual(new Date("2024-03-01"));
  });

  it("walks every CDN page", async () => {
    const story = (slug: string) => ({
      slug,
      full_slug: slug,
      first_published_at: "2024-01-01",
      published_at: null,
      is_startpage: false,
    });
    getStories
      .mockResolvedValueOnce({ stories: [story("a")], total: 2, perPage: 1 })
      .mockResolvedValueOnce({ stories: [story("b")], total: 2, perPage: 1 });

    const entries = await sitemap();

    expect(getStories).toHaveBeenCalledTimes(2);
    expect(getStories).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
    expect(entries.map((e) => e.url)).toEqual(
      expect.arrayContaining(["https://example.test/a", "https://example.test/b"]),
    );
  });

  it("attaches featured and inline images", async () => {
    getStories.mockResolvedValueOnce({
      stories: [
        {
          slug: "project",
          full_slug: "work/project",
          first_published_at: "2024-01-01",
          published_at: null,
          is_startpage: false,
          content: {
            images: [{ filename: "https://cdn/a.jpg" }],
            body: [
              { component: "image", image: { filename: "https://cdn/a.jpg" } },
              { component: "image", image: { filename: "https://cdn/b.jpg" } },
              { component: "music_player", title: "Song", artwork: "https://cdn/art.jpg" },
            ],
          },
        },
      ],
    });

    const entries = await sitemap();
    const work = entries.find((e) => e.url === "https://example.test/work/project");

    expect(work?.images).toEqual(["https://cdn/a.jpg", "https://cdn/b.jpg"]);
  });
});
