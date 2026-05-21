import { beforeEach, vi } from "vitest";

vi.mock("@httpjpg/storyblok-api", () => ({
  getStoryblokApi: vi.fn(),
}));

vi.mock("@httpjpg/storyblok-next", () => ({
  CACHE_TAGS: { STORIES: "stories" },
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

import { getStoryblokApi } from "@httpjpg/storyblok-api";

import { getLastUpdated } from "./last-updated";

const mockGetStoryblokApi = vi.mocked(getStoryblokApi);

function setupGetStories(impl: (args: unknown) => unknown) {
  mockGetStoryblokApi.mockReturnValue({
    getStories: vi.fn(impl as never),
  } as never);
}

describe("getLastUpdated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("returns the most recent story's published_at", async () => {
    setupGetStories(async () => ({
      stories: [{ published_at: "2026-05-21T12:00:00Z" }],
    }));
    await expect(getLastUpdated()).resolves.toBe("2026-05-21T12:00:00Z");
  });

  it("requests one story sorted descending by published_at on the published version", async () => {
    const getStories = vi.fn(async () => ({ stories: [] }));
    mockGetStoryblokApi.mockReturnValue({ getStories } as never);
    await getLastUpdated();
    expect(getStories).toHaveBeenCalledWith({
      per_page: 1,
      sort_by: "published_at:desc",
      version: "published",
    });
  });

  it("uses the non-draft Storyblok client", async () => {
    setupGetStories(async () => ({ stories: [] }));
    await getLastUpdated();
    expect(mockGetStoryblokApi).toHaveBeenCalledWith({ draftMode: false });
  });

  it("returns undefined when no stories are returned", async () => {
    setupGetStories(async () => ({ stories: [] }));
    await expect(getLastUpdated()).resolves.toBeUndefined();
  });

  it("returns undefined when stories is missing entirely", async () => {
    setupGetStories(async () => ({}));
    await expect(getLastUpdated()).resolves.toBeUndefined();
  });

  it("logs and returns undefined when the API throws", async () => {
    setupGetStories(async () => {
      throw new Error("offline");
    });
    await expect(getLastUpdated()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching last-updated timestamp:",
      expect.any(Error),
    );
  });
});
