import { beforeEach, vi } from "vitest";

vi.mock("@httpjpg/storyblok-api", () => ({
  getStoryblokApi: vi.fn(),
}));

vi.mock("@httpjpg/storyblok-next", () => ({
  CACHE_TAGS: {
    STORY: (slug: string) => `story-${slug}`,
    STORIES: "stories",
  },
  fetchStory: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { fetchStory } from "@httpjpg/storyblok-next";

import { getAdjacentWork, getCachedStory, getRecentWork } from "./work";

const mockGetStoryblokApi = vi.mocked(getStoryblokApi);
const mockFetchStory = vi.mocked(fetchStory);

function workStory(overrides: Record<string, unknown> = {}) {
  return {
    uuid: "u",
    slug: "demo",
    full_slug: "work/demo",
    name: "Demo",
    content: { title: "Demo", date: "2026-01-01" },
    ...overrides,
  };
}

describe("getCachedStory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to fetchStory with the work-list relation", async () => {
    mockFetchStory.mockResolvedValue({ uuid: "u" } as never);
    await getCachedStory("work/demo", { draftMode: true });
    expect(mockFetchStory).toHaveBeenCalledWith("work/demo", {
      draftMode: true,
      resolveRelations: ["work_list.work"],
    });
  });

  it("forwards the draftMode flag through to fetchStory", async () => {
    mockFetchStory.mockResolvedValue({ uuid: "u" } as never);
    await getCachedStory("home", { draftMode: false });
    expect(mockFetchStory).toHaveBeenCalledWith("home", {
      draftMode: false,
      resolveRelations: ["work_list.work"],
    });
  });
});

describe("getRecentWork", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  function setupRecentWork(
    draftStories: ReturnType<typeof workStory>[],
    publishedStories: Array<ReturnType<typeof workStory> & { first_published_at?: string | null }>,
  ) {
    const getStories = vi.fn(async (args: { version?: string }) => {
      if (args.version === "published") {
        return { stories: publishedStories };
      }
      return { stories: draftStories };
    });
    mockGetStoryblokApi.mockReturnValue({ getStories } as never);
    return getStories;
  }

  it("partitions stories into projects vs websites by tag", async () => {
    setupRecentWork(
      [
        workStory({
          uuid: "p1",
          slug: "projects-1",
          full_slug: "work/projects-1",
          tag_list: ["Projects"],
        }),
        workStory({
          uuid: "c1",
          slug: "websites-1",
          full_slug: "work/websites-1",
          tag_list: ["Websites"],
        }),
        workStory({
          uuid: "u1",
          slug: "untagged",
          full_slug: "work/untagged",
          tag_list: [],
        }),
      ],
      [
        { ...workStory({ uuid: "p1", slug: "projects-1" }), first_published_at: "2026-01-01" },
        { ...workStory({ uuid: "c1", slug: "websites-1" }), first_published_at: "2026-01-02" },
        { ...workStory({ uuid: "u1", slug: "untagged" }), first_published_at: "2026-01-03" },
      ],
    );

    const result = await getRecentWork();
    const projectsIds = result.projectsWork.map((w) => w.id);
    const websitesIds = result.websitesWork.map((w) => w.id);
    expect(projectsIds).toEqual(expect.arrayContaining(["p1", "u1"]));
    expect(projectsIds).not.toContain("c1");
    expect(websitesIds).toEqual(["c1"]);
  });

  it("filters out stories nested deeper than work/<slug>", async () => {
    setupRecentWork(
      [
        workStory({ uuid: "ok", slug: "direct", full_slug: "work/direct" }),
        workStory({ uuid: "nested", slug: "nested", full_slug: "work/nested/child" }),
      ],
      [
        { ...workStory({ uuid: "ok", slug: "direct" }), first_published_at: "x" },
        { ...workStory({ uuid: "nested", slug: "nested" }), first_published_at: "x" },
      ],
    );
    const result = await getRecentWork();
    const ids = [...result.projectsWork, ...result.websitesWork].map((w) => w.id);
    expect(ids).toContain("ok");
    expect(ids).not.toContain("nested");
  });

  it("hides unpublished stories in production", async () => {
    setupRecentWork(
      [workStory({ uuid: "draft", slug: "draft-one", full_slug: "work/draft-one" })],
      [{ ...workStory({ uuid: "draft", slug: "draft-one" }), first_published_at: null }],
    );
    const result = await getRecentWork();
    expect(result.projectsWork).toEqual([]);
    expect(result.websitesWork).toEqual([]);
  });

  it("marks stories with first_published_at as not draft", async () => {
    setupRecentWork(
      [workStory({ uuid: "live", slug: "live-one", full_slug: "work/live-one" })],
      [{ ...workStory({ uuid: "live", slug: "live-one" }), first_published_at: "2026-01-01" }],
    );
    const result = await getRecentWork();
    expect(result.projectsWork[0]?.isDraft).toBe(false);
  });

  it("uses the external link as the slug when external_only is true", async () => {
    setupRecentWork(
      [
        workStory({
          uuid: "ext",
          slug: "external-1",
          full_slug: "work/external-1",
          content: {
            title: "Ext",
            external_only: true,
            link: { url: "https://example.com/case" },
          },
        }),
      ],
      [
        {
          ...workStory({ uuid: "ext", slug: "external-1" }),
          first_published_at: "2026-01-01",
        },
      ],
    );
    const result = await getRecentWork();
    expect(result.projectsWork[0]?.slug).toBe("https://example.com/case");
    expect(result.projectsWork[0]?.isExternal).toBe(true);
    expect(result.projectsWork[0]?.externalUrl).toBe("https://example.com/case");
  });

  it("exposes externalUrl when the story has a link but is not external_only", async () => {
    setupRecentWork(
      [
        workStory({
          uuid: "prev",
          slug: "internal-1",
          full_slug: "work/internal-1",
          tag_list: ["Websites"],
          content: {
            title: "Website case",
            link: { url: "https://client.example/preview" },
          },
        }),
      ],
      [
        {
          ...workStory({ uuid: "prev", slug: "internal-1" }),
          first_published_at: "2026-01-01",
        },
      ],
    );
    const result = await getRecentWork();
    expect(result.websitesWork[0]?.slug).toBe("internal-1");
    expect(result.websitesWork[0]?.isExternal).toBe(false);
    expect(result.websitesWork[0]?.externalUrl).toBe("https://client.example/preview");
  });

  it("falls back to story.name when content.title is missing", async () => {
    setupRecentWork(
      [
        workStory({
          uuid: "fallback",
          slug: "fallback-slug",
          full_slug: "work/fallback-slug",
          name: "Fallback Name",
          content: {},
        }),
      ],
      [
        {
          ...workStory({ uuid: "fallback", slug: "fallback-slug" }),
          first_published_at: "2026-01-01",
        },
      ],
    );
    const result = await getRecentWork();
    expect(result.projectsWork[0]?.title).toBe("Fallback Name");
  });

  it("returns empty arrays and logs when the API throws", async () => {
    mockGetStoryblokApi.mockReturnValue({
      getStories: vi.fn(async () => {
        throw new Error("boom");
      }),
    } as never);
    await expect(getRecentWork()).resolves.toEqual({ projectsWork: [], websitesWork: [] });
    expect(console.error).toHaveBeenCalledWith("Error fetching work items:", expect.any(Error));
  });
});

describe("getAdjacentWork", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupAdjacent(stories: ReturnType<typeof workStory>[]) {
    mockGetStoryblokApi.mockReturnValue({
      getStories: vi.fn(async () => ({ stories })),
    } as never);
  }

  it("returns prev/next when the current slug is in the middle", async () => {
    setupAdjacent([
      workStory({ slug: "a", full_slug: "work/a", content: { title: "A" } }),
      workStory({ slug: "b", full_slug: "work/b", content: { title: "B" } }),
      workStory({ slug: "c", full_slug: "work/c", content: { title: "C" } }),
    ]);
    const result = await getAdjacentWork("b");
    expect(result.prev).toEqual({ slug: "a", title: "A" });
    expect(result.next).toEqual({ slug: "c", title: "C" });
  });

  it("returns no prev for the first story", async () => {
    setupAdjacent([
      workStory({ slug: "a", full_slug: "work/a", content: { title: "A" } }),
      workStory({ slug: "b", full_slug: "work/b", content: { title: "B" } }),
    ]);
    const result = await getAdjacentWork("a");
    expect(result.prev).toBeUndefined();
    expect(result.next).toEqual({ slug: "b", title: "B" });
  });

  it("returns no next for the last story", async () => {
    setupAdjacent([
      workStory({ slug: "a", full_slug: "work/a", content: { title: "A" } }),
      workStory({ slug: "b", full_slug: "work/b", content: { title: "B" } }),
    ]);
    const result = await getAdjacentWork("b");
    expect(result.next).toBeUndefined();
    expect(result.prev).toEqual({ slug: "a", title: "A" });
  });

  it("returns an empty object when the slug is not in the list", async () => {
    setupAdjacent([workStory({ slug: "a", full_slug: "work/a", content: { title: "A" } })]);
    await expect(getAdjacentWork("missing")).resolves.toEqual({});
  });

  it("skips nested work entries when computing adjacency", async () => {
    setupAdjacent([
      workStory({ slug: "a", full_slug: "work/a", content: { title: "A" } }),
      workStory({ slug: "nested", full_slug: "work/nested/child", content: { title: "Nested" } }),
      workStory({ slug: "b", full_slug: "work/b", content: { title: "B" } }),
    ]);
    const result = await getAdjacentWork("a");
    expect(result.next).toEqual({ slug: "b", title: "B" });
  });

  it("falls back to the story name when content.title is missing", async () => {
    setupAdjacent([
      workStory({ slug: "a", full_slug: "work/a", name: "A Name", content: {} }),
      workStory({ slug: "b", full_slug: "work/b", name: "B Name", content: {} }),
    ]);
    const result = await getAdjacentWork("a");
    expect(result.next).toEqual({ slug: "b", title: "B Name" });
  });

  it("returns an empty object when the API throws", async () => {
    mockGetStoryblokApi.mockReturnValue({
      getStories: vi.fn(async () => {
        throw new Error("offline");
      }),
    } as never);
    await expect(getAdjacentWork("a")).resolves.toEqual({});
  });
});
