// @vitest-environment node
import { beforeEach, vi } from "vitest";

const { getStory, getStoryblokApi } = vi.hoisted(() => {
  const getStory = vi.fn().mockResolvedValue({ slug: "home" });
  const getStoryblokApi = vi.fn(() => ({ getStory }));
  return { getStory, getStoryblokApi };
});

vi.mock("@httpjpg/storyblok-api", () => ({ getStoryblokApi }));
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("next/server", () => ({ connection: vi.fn(async () => undefined) }));

import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import { readStory } from "./read-story";

beforeEach(() => {
  vi.clearAllMocks();
  getStory.mockResolvedValue({ slug: "home" });
});

describe("readStory · draft", () => {
  it("fetches through the draft client and never enters the cache scope", async () => {
    const result = await readStory("home", { draft: true });
    expect(getStoryblokApi).toHaveBeenCalledWith({ draftMode: true });
    expect(cacheLife).not.toHaveBeenCalled();
    expect(cacheTag).not.toHaveBeenCalled();
    expect(result).toEqual({ slug: "home" });
  });

  it("waits for request time before reading drafts", async () => {
    await readStory("home", { draft: true });
    expect(connection).toHaveBeenCalledTimes(1);
  });

  it("forwards relations to the draft fetch", async () => {
    await readStory("home", { draft: true, relations: ["b", "a"] });
    expect(getStory).toHaveBeenCalledWith({ slug: "home", resolve_relations: ["a", "b"] });
  });
});

describe("readStory · published", () => {
  it("caches under the cms lifetime with story + stories tags", async () => {
    await readStory("work/foo");
    expect(getStoryblokApi).toHaveBeenCalledWith({ draftMode: false });
    expect(cacheLife).toHaveBeenCalledWith("cms");
    expect(cacheTag).toHaveBeenCalledWith("cms:story:work/foo", "cms:stories");
    expect(connection).not.toHaveBeenCalled();
  });

  it("leaves resolve_relations undefined when none are given", async () => {
    await readStory("home");
    expect(getStory).toHaveBeenCalledWith({ slug: "home", resolve_relations: undefined });
  });

  it("sorts relations so call order cannot split the cache key", async () => {
    await readStory("home", { relations: ["c", "a", "b"] });
    expect(getStory).toHaveBeenCalledWith({ slug: "home", resolve_relations: ["a", "b", "c"] });
  });

  it("does not mutate the caller's relations", async () => {
    const relations = ["b", "a"];
    await readStory("home", { relations });
    expect(relations).toEqual(["b", "a"]);
  });

  it("passes the language through", async () => {
    await readStory("cv", { language: "de" });
    expect(getStory).toHaveBeenCalledWith({
      slug: "cv",
      resolve_relations: undefined,
      language: "de",
    });
  });
});

describe("readStory · language fallback", () => {
  it("retries the default language when the translated fetch returns null", async () => {
    getStory.mockResolvedValueOnce(null).mockResolvedValueOnce({ slug: "cv" });
    const result = await readStory("cv", { draft: true, language: "de" });
    expect(result).toEqual({ slug: "cv" });
    expect(getStory).toHaveBeenNthCalledWith(2, { slug: "cv", resolve_relations: undefined });
  });

  it("does not retry when the default language is already requested", async () => {
    getStory.mockResolvedValueOnce(null);
    const result = await readStory("missing", { draft: true });
    expect(result).toBeNull();
    expect(getStory).toHaveBeenCalledTimes(1);
  });
});
