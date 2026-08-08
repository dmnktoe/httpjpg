// @vitest-environment node
import { beforeEach, vi } from "vitest";

const { mockGet, ClientCtor } = vi.hoisted(() => {
  const mockGet = vi.fn();
  const ClientCtor = vi.fn(function () {
    return { get: mockGet };
  });
  return { mockGet, ClientCtor };
});

vi.mock("storyblok-js-client", () => ({ default: ClientCtor }));
vi.mock("@httpjpg/env", () => ({
  env: {
    NEXT_PUBLIC_STORYBLOK_TOKEN: "public-token",
    STORYBLOK_PREVIEW_TOKEN: "preview-token",
    NEXT_PUBLIC_STORYBLOK_VERSION: "published",
  },
}));

import { getStoryblokApi } from "./api";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getStoryblokApi · client construction", () => {
  it("uses the public token by default", () => {
    getStoryblokApi();
    expect(ClientCtor).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "public-token" }),
    );
  });

  it("uses the preview token in draft mode", () => {
    getStoryblokApi({ draftMode: true });
    expect(ClientCtor).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "preview-token" }),
    );
  });

  it("exposes the underlying client", () => {
    const api = getStoryblokApi();
    expect(api.client).toBeDefined();
  });
});

describe("getStory", () => {
  it("returns the story from the response", async () => {
    const story = { name: "Home", slug: "home" };
    mockGet.mockResolvedValueOnce({ data: { story } });
    const result = await getStoryblokApi().getStory({ slug: "home" });
    expect(result).toBe(story);
  });

  it("requests the published version by default", async () => {
    mockGet.mockResolvedValueOnce({ data: { story: {} } });
    await getStoryblokApi().getStory({ slug: "home" });
    expect(mockGet).toHaveBeenCalledWith(
      "cdn/stories/home",
      expect.objectContaining({ version: "published" }),
    );
  });

  it("requests the draft version in draft mode", async () => {
    mockGet.mockResolvedValueOnce({ data: { story: {} } });
    await getStoryblokApi({ draftMode: true }).getStory({ slug: "home" });
    expect(mockGet).toHaveBeenCalledWith(
      "cdn/stories/home",
      expect.objectContaining({ version: "draft" }),
    );
  });

  it("joins resolve_relations and forwards resolve_links", async () => {
    mockGet.mockResolvedValueOnce({ data: { story: {} } });
    await getStoryblokApi().getStory({
      slug: "work/foo",
      resolve_relations: ["a.b", "c.d"],
      resolve_links: "url",
    });
    expect(mockGet).toHaveBeenCalledWith(
      "cdn/stories/work/foo",
      expect.objectContaining({ resolve_relations: "a.b,c.d", resolve_links: "url" }),
    );
  });

  it("leaves resolve_relations undefined when none are given", async () => {
    mockGet.mockResolvedValueOnce({ data: { story: {} } });
    await getStoryblokApi().getStory({ slug: "home" });
    expect(mockGet.mock.calls[0][1]).toMatchObject({ resolve_relations: undefined });
  });

  it.each([404, 401, 403])("returns null without logging on a %i", async (status) => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockRejectedValueOnce({ status });
    const result = await getStoryblokApi().getStory({ slug: "missing" });
    expect(result).toBeNull();
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("reads the status from error.response.status", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockRejectedValueOnce({ response: { status: 404 } });
    expect(await getStoryblokApi().getStory({ slug: "missing" })).toBeNull();
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("returns null and logs on unexpected errors", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockRejectedValueOnce({ status: 500 });
    const result = await getStoryblokApi().getStory({ slug: "boom" });
    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

describe("getStories", () => {
  it("maps stories, total and perPage", async () => {
    mockGet.mockResolvedValueOnce({
      data: { stories: [{ slug: "a" }, { slug: "b" }] },
      total: 2,
      perPage: 25,
    });
    const result = await getStoryblokApi().getStories({ starts_with: "work/" });
    expect(result).toEqual({ stories: [{ slug: "a" }, { slug: "b" }], total: 2, perPage: 25 });
  });

  it("applies default pagination", async () => {
    mockGet.mockResolvedValueOnce({ data: { stories: [] }, total: 0, perPage: 0 });
    await getStoryblokApi().getStories();
    expect(mockGet).toHaveBeenCalledWith(
      "cdn/stories",
      expect.objectContaining({ per_page: 25, page: 1 }),
    );
  });

  it("prefers an explicit version over draft mode", async () => {
    mockGet.mockResolvedValueOnce({ data: { stories: [] }, total: 0, perPage: 0 });
    await getStoryblokApi({ draftMode: true }).getStories({ version: "published" });
    expect(mockGet).toHaveBeenCalledWith(
      "cdn/stories",
      expect.objectContaining({ version: "published" }),
    );
  });

  it("returns an empty result and logs on error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockRejectedValueOnce(new Error("network"));
    const result = await getStoryblokApi().getStories();
    expect(result).toEqual({ stories: [], total: 0, perPage: 0 });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
