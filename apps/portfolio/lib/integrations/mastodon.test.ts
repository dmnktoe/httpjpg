// @vitest-environment node
import { beforeEach, type MockedFunction, vi } from "vitest";

import { fetchMastodonPosts, parseMastodonHandle, toPost } from "./mastodon";

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

const HANDLE = { user: "dmnk", host: "mastodon.social" };

const STATUS = {
  id: "1",
  url: "https://mastodon.social/@dmnk/1",
  content: "<p>Hello <a href='https://example.test'>world</a></p>",
  created_at: "2026-08-01T10:00:00.000Z",
  media_attachments: [],
};

describe("parseMastodonHandle", () => {
  it("accepts a handle with or without the leading at sign", () => {
    expect(parseMastodonHandle("@dmnk@mastodon.social")).toEqual(HANDLE);
    expect(parseMastodonHandle("dmnk@mastodon.social")).toEqual(HANDLE);
    expect(parseMastodonHandle("  @dmnk@mastodon.social  ")).toEqual(HANDLE);
  });

  it("lowercases the instance host", () => {
    expect(parseMastodonHandle("@dmnk@Mastodon.Social")).toEqual(HANDLE);
  });

  it("accepts a subdomain instance", () => {
    expect(parseMastodonHandle("@a@social.example.co.uk")).toEqual({
      user: "a",
      host: "social.example.co.uk",
    });
  });

  it("rejects handles that are missing a part", () => {
    expect(parseMastodonHandle("@dmnk")).toBeNull();
    expect(parseMastodonHandle("dmnk")).toBeNull();
    expect(parseMastodonHandle("@a@b@c")).toBeNull();
    expect(parseMastodonHandle("")).toBeNull();
  });

  it("rejects hosts that could reshape the request url", () => {
    expect(parseMastodonHandle("@dmnk@evil.test/path")).toBeNull();
    expect(parseMastodonHandle("@dmnk@evil.test:8080")).toBeNull();
    expect(parseMastodonHandle("@dmnk@localhost")).toBeNull();
    expect(parseMastodonHandle("@dmnk@-bad.test")).toBeNull();
  });

  it("rejects non-string values", () => {
    expect(parseMastodonHandle(undefined)).toBeNull();
    expect(parseMastodonHandle(42)).toBeNull();
  });
});

describe("toPost", () => {
  it("flattens the status html into text", () => {
    expect(toPost(STATUS)).toEqual({
      text: "Hello world",
      url: "https://mastodon.social/@dmnk/1",
      createdAt: "2026-08-01T10:00:00.000Z",
      hasMedia: false,
      isSensitive: false,
    });
  });

  it("shows the content warning instead of hidden content", () => {
    const post = toPost({ ...STATUS, spoiler_text: "spoilers", content: "<p>secret</p>" });

    expect(post).toMatchObject({ text: "CW: spoilers", isSensitive: true });
  });

  it("flags attached media", () => {
    expect(toPost({ ...STATUS, media_attachments: [{}] })).toMatchObject({ hasMedia: true });
  });

  it("falls back to the uri when the url is missing", () => {
    expect(
      toPost({ ...STATUS, url: undefined, uri: "https://mastodon.social/users/dmnk/1" }),
    ).toMatchObject({ url: "https://mastodon.social/users/dmnk/1" });
  });

  it("skips statuses without a link or without text", () => {
    expect(toPost({ ...STATUS, url: undefined, uri: undefined })).toBeNull();
    expect(toPost({ ...STATUS, content: "<p></p>" })).toBeNull();
  });

  it("marks a sensitive status without a spoiler text", () => {
    expect(toPost({ ...STATUS, sensitive: true })).toMatchObject({ isSensitive: true });
  });
});

describe("fetchMastodonPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("looks the account up, then reads its statuses", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ id: "42" }))
      .mockResolvedValueOnce(jsonResponse([STATUS]));

    const result = await fetchMastodonPosts(HANDLE);

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "https://mastodon.social/api/v1/accounts/lookup?acct=dmnk",
      expect.anything(),
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "https://mastodon.social/api/v1/accounts/42/statuses?limit=4&exclude_replies=true&exclude_reblogs=true",
      expect.anything(),
    );
    expect(result).toMatchObject({ ok: true, posts: [{ text: "Hello world" }] });
  });

  it("surfaces a failed lookup without asking for statuses", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse("", false, 404));

    const result = await fetchMastodonPosts(HANDLE);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ ok: false, status: 404 });
  });

  it("fails when the lookup returns no account id", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));

    const result = await fetchMastodonPosts(HANDLE);

    expect(result).toEqual({
      ok: false,
      status: 502,
      message: "Unexpected response from the Mastodon API.",
    });
  });

  it("surfaces a failed statuses request", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ id: "42" }))
      .mockResolvedValueOnce(jsonResponse("", false, 503));

    const result = await fetchMastodonPosts(HANDLE);

    expect(result).toMatchObject({ ok: false, status: 503 });
  });

  it("fails when the statuses payload is not a list", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ id: "42" }))
      .mockResolvedValueOnce(jsonResponse({ error: "nope" }));

    const result = await fetchMastodonPosts(HANDLE);

    expect(result).toMatchObject({ ok: false, status: 502 });
  });

  it("drops unusable statuses and honours the limit", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ id: "42" }))
      .mockResolvedValueOnce(
        jsonResponse([{ ...STATUS, content: "<p></p>" }, STATUS, { ...STATUS, id: "2" }]),
      );

    const result = await fetchMastodonPosts(HANDLE, 1);

    expect(result).toMatchObject({ ok: true });
    if (result.ok) {
      expect(result.posts).toHaveLength(1);
    }
  });

  it("reports a timeout as a 504", async () => {
    mockFetch.mockRejectedValueOnce(new DOMException("aborted", "AbortError"));

    const result = await fetchMastodonPosts(HANDLE);

    expect(result).toEqual({ ok: false, status: 504, message: "Mastodon request timed out." });
  });
});
