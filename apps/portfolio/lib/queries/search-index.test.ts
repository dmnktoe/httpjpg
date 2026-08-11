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
    const getStories = mockStories([story()]);

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
        tags: [],
        tagValues: [],
        excerpt: "Demo Project A stark site",
        date: "2026-01-01",
        media: [],
      },
    ]);
  });

  it("resolves curated tags to labels and keeps their values", async () => {
    mockStories([
      story({
        tag_list: ["Projects"],
        content: {
          component: "work",
          title: "Demo Project",
          tags: ["typescript", "ios", "not-a-real-tag"],
        },
      }),
    ]);

    const [document] = await getSearchIndex();

    expect(document.tags).toEqual(["TypeScript", "iOS"]);
    expect(document.tagValues).toEqual(["typescript", "ios"]);
  });

  it("keeps loose story tags as extra search surface but drops the taxonomy ones", async () => {
    mockStories([
      story({
        tag_list: ["Projects", "Websites", "Riso"],
        content: { component: "work", title: "Demo Project", tags: ["print"] },
      }),
    ]);

    const [document] = await getSearchIndex();

    expect(document.tags).toEqual(["Print", "Riso"]);
    expect(document.tagValues).toEqual(["print"]);
  });

  it("carries the story's thumbnails into the document", async () => {
    mockStories([
      story({
        content: {
          component: "work",
          title: "Demo Project",
          body: [
            {
              component: "image",
              _uid: "image-1",
              alt: "Print run",
              image: { filename: "https://a.storyblok.com/f/1/2x2/abc/print.jpeg" },
            },
          ],
        },
      }),
    ]);

    const [document] = await getSearchIndex();

    expect(document.media).toMatchObject([{ kind: "image", label: "Print run" }]);
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

  it("throws rather than caching an empty result", async () => {
    const getStories = vi.fn().mockResolvedValue({ stories: [], total: 0, perPage: 100 });
    mockGetStoryblokApi.mockReturnValue({ getStories } as never);

    await expect(getSearchIndex()).rejects.toThrow(/no stories/i);
  });

  it("propagates an unexpected failure to the caller", async () => {
    const getStories = vi.fn().mockRejectedValue(new Error("storyblok down"));
    mockGetStoryblokApi.mockReturnValue({ getStories } as never);

    await expect(getSearchIndex()).rejects.toThrow("storyblok down");
  });

  it("still returns an empty index when every story is filtered out", async () => {
    mockStories([story({ full_slug: "config", content: { component: "config" } })]);

    await expect(getSearchIndex()).resolves.toEqual([]);
  });
});

describe("getSearchIndex · draft mode", () => {
  it("asks Storyblok for published stories by default", async () => {
    const getStories = mockStories([story()]);

    await getSearchIndex();

    expect(mockGetStoryblokApi).toHaveBeenCalledWith({ draftMode: false });
    expect(getStories).toHaveBeenCalledWith({ per_page: 100, page: 1, version: "published" });
  });

  it("asks for drafts through the draft client when requested", async () => {
    const getStories = mockStories([story()]);

    await getSearchIndex({ draftMode: true });

    expect(mockGetStoryblokApi).toHaveBeenCalledWith({ draftMode: true });
    expect(getStories).toHaveBeenCalledWith(expect.objectContaining({ version: "draft", page: 1 }));
  });

  it("busts Storyblok's own cache so an edit shows up immediately", async () => {
    const getStories = mockStories([story()]);

    await getSearchIndex({ draftMode: true });

    expect(getStories.mock.calls[0][0]).toHaveProperty("cv");
  });

  it("marks a never-published story as a draft", async () => {
    mockStories([story({ first_published_at: null })]);

    const [document] = await getSearchIndex({ draftMode: true });

    expect(document.isDraft).toBe(true);
  });

  it("leaves the flag off a published story", async () => {
    mockStories([story({ first_published_at: "2026-01-01" })]);

    const [document] = await getSearchIndex({ draftMode: true });

    expect(document).not.toHaveProperty("isDraft");
  });
});
