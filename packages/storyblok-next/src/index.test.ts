// @vitest-environment node
import { beforeEach, vi } from "vitest";

const { getStory, getStoryblokApi } = vi.hoisted(() => {
  const getStory = vi.fn().mockResolvedValue({ slug: "home" });
  const getStoryblokApi = vi.fn(() => ({ getStory }));
  return { getStory, getStoryblokApi };
});

vi.mock("@httpjpg/storyblok-api", () => ({ getStoryblokApi }));
vi.mock("next/cache", () => ({
  // Record the cache key + options, then run the wrapped fetcher straight through.
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown, keys: string[], options: unknown) => {
    const wrapped = (...args: unknown[]) => fn(...args);
    (wrapped as { keys?: string[] }).keys = keys;
    (wrapped as { options?: unknown }).options = options;
    return wrapped;
  }),
}));

import { unstable_cache } from "next/cache";

import { CACHE_TAGS, fetchStory } from "./index";

const cacheMock = vi.mocked(unstable_cache);

beforeEach(() => {
  vi.clearAllMocks();
  getStory.mockResolvedValue({ slug: "home" });
});

describe("CACHE_TAGS", () => {
  it("namespaces story tags by slug", () => {
    expect(CACHE_TAGS.STORY("home")).toBe("story-home");
    expect(CACHE_TAGS.STORIES).toBe("stories");
    expect(CACHE_TAGS.CONFIG).toBe("storyblok-config");
  });
});

describe("fetchStory · draft mode", () => {
  it("fetches fresh through the draft client and bypasses the cache", async () => {
    const result = await fetchStory("home", { draftMode: true });
    expect(getStoryblokApi).toHaveBeenCalledWith({ draftMode: true });
    expect(cacheMock).not.toHaveBeenCalled();
    expect(result).toEqual({ slug: "home" });
  });

  it("forwards resolve_relations to the draft fetch", async () => {
    await fetchStory("home", { draftMode: true, resolveRelations: ["a", "b"] });
    expect(getStory).toHaveBeenCalledWith({ slug: "home", resolve_relations: ["a", "b"] });
  });
});

describe("fetchStory · production", () => {
  it("wraps the fetch in unstable_cache with story + stories tags and a 1h TTL", async () => {
    await fetchStory("home");
    expect(getStoryblokApi).toHaveBeenCalledWith();
    expect(cacheMock).toHaveBeenCalledTimes(1);
    const [, keys, options] = cacheMock.mock.calls[0];
    expect(keys).toEqual(["story-home", "relations-"]);
    expect(options).toEqual({
      tags: ["story-home", "stories"],
      revalidate: 3600,
    });
  });

  it("leaves resolve_relations undefined when none are given", async () => {
    await fetchStory("home");
    expect(getStory).toHaveBeenCalledWith({ slug: "home", resolve_relations: undefined });
  });

  it("sorts relations so call order does not change the cache key", async () => {
    await fetchStory("home", { resolveRelations: ["c", "a", "b"] });
    const [, keys] = cacheMock.mock.calls[0];
    expect(keys).toEqual(["story-home", "relations-a,b,c"]);
    expect(getStory).toHaveBeenCalledWith({ slug: "home", resolve_relations: ["a", "b", "c"] });
  });

  it("produces the same cache key regardless of relation order", async () => {
    await fetchStory("home", { resolveRelations: ["a", "b"] });
    await fetchStory("home", { resolveRelations: ["b", "a"] });
    expect(cacheMock.mock.calls[0][1]).toEqual(cacheMock.mock.calls[1][1]);
  });
});
