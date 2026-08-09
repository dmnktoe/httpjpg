// @vitest-environment node
vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getStory, getStoryblokApi, fetchMastodonPosts, parseMastodonHandle } = vi.hoisted(() => ({
  getStory: vi.fn(),
  getStoryblokApi: vi.fn(),
  fetchMastodonPosts: vi.fn(),
  parseMastodonHandle: vi.fn((): { user: string; host: string } | null => ({
    user: "dmnk",
    host: "mastodon.social",
  })),
}));

vi.mock("@httpjpg/storyblok-api", () => ({ getStoryblokApi }));

vi.mock("@/lib/integrations/mastodon", () => ({ fetchMastodonPosts, parseMastodonHandle }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";

import { GET } from "./route";

const HANDLE = { user: "dmnk", host: "mastodon.social" };

beforeEach(() => {
  vi.clearAllMocks();
  getStoryblokApi.mockReturnValue({ getStory });
  parseMastodonHandle.mockReturnValue(HANDLE);
});

describe("GET /api/mastodon", () => {
  it("returns the posts and the normalised handle", async () => {
    getStory.mockResolvedValueOnce({ content: { mastodon_handle: "@dmnk@mastodon.social" } });
    fetchMastodonPosts.mockResolvedValueOnce({ ok: true, posts: [{ text: "Hello" }] });

    const response = await GET();

    expect(fetchMastodonPosts).toHaveBeenCalledWith(HANDLE);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      posts: [{ text: "Hello" }],
      handle: "@dmnk@mastodon.social",
    });
  });

  it("caches the response at the edge", async () => {
    getStory.mockResolvedValueOnce({ content: { mastodon_handle: "@dmnk@mastodon.social" } });
    fetchMastodonPosts.mockResolvedValueOnce({ ok: true, posts: [] });

    const response = await GET();

    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300");
  });

  it("returns 501 when no handle is configured", async () => {
    getStory.mockResolvedValueOnce({ content: {} });

    const response = await GET();

    expect(response.status).toBe(501);
    expect(parseMastodonHandle).not.toHaveBeenCalled();
  });

  it("returns 501 for a malformed handle", async () => {
    getStory.mockResolvedValueOnce({ content: { mastodon_handle: "@dmnk@localhost" } });
    parseMastodonHandle.mockReturnValue(null);

    const response = await GET();

    expect(response.status).toBe(501);
    expect(fetchMastodonPosts).not.toHaveBeenCalled();
  });

  it("returns 501 when the config story cannot be read", async () => {
    getStory.mockRejectedValueOnce(new Error("storyblok down"));

    const response = await GET();

    expect(response.status).toBe(501);
  });

  it("propagates the upstream status when the instance fails", async () => {
    getStory.mockResolvedValueOnce({ content: { mastodon_handle: "@dmnk@mastodon.social" } });
    fetchMastodonPosts.mockResolvedValueOnce({ ok: false, status: 503, message: "down" });

    const response = await GET();

    expect(response.status).toBe(503);
  });

  it("reports unexpected errors and returns a 500", async () => {
    getStory.mockResolvedValueOnce({ content: { mastodon_handle: "@dmnk@mastodon.social" } });
    fetchMastodonPosts.mockRejectedValueOnce(new Error("boom"));

    const response = await GET();

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });

  it("reads the config through the request's draft mode", async () => {
    const { draftMode } = await import("next/headers");
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: true } as never);
    getStory.mockResolvedValueOnce({ content: { mastodon_handle: "@dmnk@mastodon.social" } });

    await GET();

    expect(getStoryblokApi).toHaveBeenCalledWith({ draftMode: true });
  });
});
