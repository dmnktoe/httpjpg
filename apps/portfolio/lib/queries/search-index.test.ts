import { beforeEach, vi } from "vitest";

vi.mock("@httpjpg/storyblok-api", () => ({
  getStoryblokApi: vi.fn(),
}));

vi.mock("@httpjpg/storyblok-next", () => ({
  CACHE_TAGS: {
    STORY: (slug: string) => `story-${slug}`,
    STORIES: "stories",
  },
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";

import { getSearchIndex } from "./search-index";

const mockGetStoryblokApi = vi.mocked(getStoryblokApi);

function mockStories(stories: unknown[]) {
  const getStories = vi.fn().mockResolvedValue({ stories, total: stories.length, perPage: 100 });
  mockGetStoryblokApi.mockReturnValue({ getStories } as never);
  return getStories;
}

function story(overrides: Record<string, unknown> = {}) {
  return {
    uuid: "uuid-1",
    slug: "demo",
    full_slug: "work/demo",
    name: "Demo",
    tag_list: ["Projects"],
    content: { component: "work", title: "Demo Project", date: "2026-01-01" },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("getSearchIndex", () => {
  it("requests published stories only", async () => {
    const getStories = mockStories([]);

    await getSearchIndex();

    expect(mockGetStoryblokApi).toHaveBeenCalledWith({ draftMode: false });
    expect(getStories).toHaveBeenCalledWith({ per_page: 100, page: 1, version: "published" });
  });

  it("maps a work story to a search document", async () => {
    mockStories([
      story({
        content: {
          component: "work",
          title: "Demo Project",
          date: "2026-01-01",
          description: {
            type: "doc",
            content: [{ type: "paragraph", content: [{ type: "text", text: "A stark site" }] }],
          },
        },
      }),
    ]);

    await expect(getSearchIndex()).resolves.toEqual([
      {
        id: "uuid-1",
        href: "/work/demo",
        title: "Demo Project",
        kind: "work",
        tags: ["Projects"],
        excerpt: "Demo Project A stark site",
        date: "2026-01-01",
      },
    ]);
  });

  it("marks non-work stories as pages", async () => {
    mockStories([
      story({ full_slug: "about", content: { component: "page", title: "About" }, tag_list: [] }),
    ]);

    const [document] = await getSearchIndex();

    expect(document).toMatchObject({ kind: "page", href: "/about" });
  });

  it("maps the home story to the site root", async () => {
    mockStories([story({ full_slug: "home", content: { component: "page", title: "Home" } })]);

    expect((await getSearchIndex())[0]?.href).toBe("/");
  });

  it("points external-only work at its external URL", async () => {
    mockStories([
      story({
        content: {
          component: "work",
          title: "External",
          external_only: true,
          link: { url: "https://example.com/thing" },
        },
      }),
    ]);

    expect((await getSearchIndex())[0]?.href).toBe("https://example.com/thing");
  });

  it("falls back to the on-site path when external-only has no URL", async () => {
    mockStories([
      story({ content: { component: "work", title: "External", external_only: true } }),
    ]);

    expect((await getSearchIndex())[0]?.href).toBe("/work/demo");
  });

  it("excludes the config story", async () => {
    mockStories([
      story({ full_slug: "config", content: { component: "config", title: "Settings" } }),
      story(),
    ]);

    const documents = await getSearchIndex();

    expect(documents).toHaveLength(1);
    expect(documents[0]?.title).toBe("Demo Project");
  });

  it("falls back to the story name when the content has no title", async () => {
    mockStories([story({ name: "Fallback Name", content: { component: "work" } })]);

    expect((await getSearchIndex())[0]?.title).toBe("Fallback Name");
  });

  it("walks every page of a multi-page space", async () => {
    const page1 = Array.from({ length: 100 }, (_item, index) =>
      story({ uuid: `a${index}`, full_slug: `work/a${index}` }),
    );
    const page2 = [story({ uuid: "b1", full_slug: "work/b1" })];
    const getStories = vi
      .fn()
      .mockResolvedValueOnce({ stories: page1, total: 101, perPage: 100 })
      .mockResolvedValueOnce({ stories: page2, total: 101, perPage: 100 });
    mockGetStoryblokApi.mockReturnValue({ getStories } as never);

    const documents = await getSearchIndex();

    expect(getStories).toHaveBeenCalledTimes(2);
    expect(getStories).toHaveBeenLastCalledWith({ per_page: 100, page: 2, version: "published" });
    expect(documents).toHaveLength(101);
  });

  it("stops after a single page when the space fits in one", async () => {
    const getStories = mockStories([story()]);

    await getSearchIndex();

    expect(getStories).toHaveBeenCalledTimes(1);
  });

  // getStories swallows its own fetch errors and returns an empty page, so an
  // outage reaches us as an empty index rather than a rejection.
  it("yields an empty index when Storyblok returns nothing", async () => {
    const getStories = vi.fn().mockResolvedValue({ stories: [], total: 0, perPage: 100 });
    mockGetStoryblokApi.mockReturnValue({ getStories } as never);

    await expect(getSearchIndex()).resolves.toEqual([]);
  });

  it("reports an unexpected failure to Sentry", async () => {
    const getStories = vi.fn().mockRejectedValue(new Error("storyblok down"));
    mockGetStoryblokApi.mockReturnValue({ getStories } as never);

    await expect(getSearchIndex()).resolves.toEqual([]);
    expect(captureServerException).toHaveBeenCalledWith(expect.any(Error), {
      tags: { query: "search-index" },
    });
  });
});
