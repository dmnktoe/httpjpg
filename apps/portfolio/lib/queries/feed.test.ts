import { beforeEach, vi } from "vitest";

vi.mock("@httpjpg/storyblok-api", () => ({
  getStoryblokApi: vi.fn(),
}));

vi.mock("@httpjpg/storyblok-next", () => ({
  CMS_TAGS: {
    story: (slug: string) => `cms:story:${slug}`,
    stories: "cms:stories",
    config: "cms:config",
  },
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { cacheLife, cacheTag } from "next/cache";

import { FEED_PAGE_SIZE, getFeedPage } from "./feed";

const mockGetStoryblokApi = vi.mocked(getStoryblokApi);

function mockStories(stories: unknown[], total = stories.length) {
  const getStories = vi.fn().mockResolvedValue({ stories, total, perPage: FEED_PAGE_SIZE });
  mockGetStoryblokApi.mockReturnValue({ getStories } as never);
  return getStories;
}

function post(slug: string, overrides: Record<string, unknown> = {}) {
  return {
    uuid: `uuid-${slug}`,
    full_slug: `feed/${slug}`,
    content: { _uid: slug, component: "post", caption: slug },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("getFeedPage", () => {
  it("reads published posts from the feed folder, newest first", async () => {
    const getStories = mockStories([post("a")]);

    await getFeedPage();

    expect(mockGetStoryblokApi).toHaveBeenCalledWith({ draftMode: false });
    expect(getStories).toHaveBeenCalledWith({
      starts_with: "feed/",
      per_page: FEED_PAGE_SIZE,
      page: 1,
      sort_by: "content.date:desc",
      version: "published",
      filter_query: { component: { in: "post" } },
    });
    expect(cacheTag).toHaveBeenCalledWith("cms:stories");
  });

  it("maps stories to posts with their permalink", async () => {
    mockStories([post("a"), post("b")]);

    const feed = await getFeedPage();

    expect(feed.posts).toEqual([
      { id: "uuid-a", href: "/feed/a", content: expect.objectContaining({ caption: "a" }) },
      { id: "uuid-b", href: "/feed/b", content: expect.objectContaining({ caption: "b" }) },
    ]);
    expect(cacheLife).toHaveBeenCalledWith("cms");
  });

  it("skips stories that are not posts", async () => {
    mockStories([
      post("a"),
      post("page", { content: { component: "page" } }),
      post("bare", { content: undefined }),
    ]);

    expect((await getFeedPage()).posts.map((entry) => entry.id)).toEqual(["uuid-a"]);
  });

  it("knows whether another page follows", async () => {
    mockStories([post("a")], FEED_PAGE_SIZE * 2 + 1);

    expect(await getFeedPage(2)).toMatchObject({ page: 2, hasMore: true });
    expect(await getFeedPage(3)).toMatchObject({ page: 3, hasMore: false });
  });

  it("holds an empty answer for seconds only", async () => {
    const getStories = vi.fn().mockResolvedValue({ stories: undefined, total: undefined });
    mockGetStoryblokApi.mockReturnValue({ getStories } as never);

    expect(await getFeedPage()).toEqual({ posts: [], page: 1, hasMore: false });
    expect(cacheLife).toHaveBeenCalledWith("seconds");
  });

  it("answers an empty page and reports when the read fails", async () => {
    const failure = new Error("boom");
    mockGetStoryblokApi.mockReturnValue({
      getStories: vi.fn().mockRejectedValue(failure),
    } as never);

    expect(await getFeedPage(4)).toEqual({ posts: [], page: 4, hasMore: false });
    expect(captureServerException).toHaveBeenCalledWith(failure, { tags: { query: "feed" } });
  });
});
