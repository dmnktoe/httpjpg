// @vitest-environment node
import { beforeEach, type MockedFunction, vi } from "vitest";

import { cleanPostText, fetchXTimeline, isXUsername, toPost, toProfile } from "./x-posts";

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

const REQUEST = {
  apiUrl: "https://api.tweetapi.com/tw-v2",
  apiKey: "secret",
  username: "dmnktoe",
};

const USER = {
  id: "10017528",
  username: "dmnktoe",
  name: "Sample User 96991",
  avatar: "https://example.com/images/sample-avatar-96991.jpg",
};

const TWEET = {
  id: "5001591756625130239",
  text: "Sample post text 83969 for documentation.",
  type: "tweet",
  createdAt: "2025-10-02T05:47:48.000Z",
  author: USER,
  media: [],
  possiblySensitive: false,
};

describe("isXUsername", () => {
  it("accepts the characters X allows", () => {
    expect(isXUsername("dmnktoe")).toBe(true);
    expect(isXUsername("a_b_1")).toBe(true);
    expect(isXUsername("a".repeat(15))).toBe(true);
  });

  it("rejects values that could reshape the request", () => {
    expect(isXUsername("a".repeat(16))).toBe(false);
    expect(isXUsername("../admin")).toBe(false);
    expect(isXUsername("user name")).toBe(false);
    expect(isXUsername("@dmnktoe")).toBe(false);
    expect(isXUsername("")).toBe(false);
    expect(isXUsername(undefined)).toBe(false);
    expect(isXUsername(42)).toBe(false);
  });
});

describe("cleanPostText", () => {
  it("decodes the entities X escapes", () => {
    expect(cleanPostText("Tom &amp; Jerry")).toBe("Tom & Jerry");
    expect(cleanPostText("&lt;tag&gt;")).toBe("<tag>");
  });

  it("drops the trailing t.co link X appends to media posts", () => {
    expect(cleanPostText("look at this https://t.co/abc123")).toBe("look at this");
  });

  it("keeps a t.co link that is not trailing", () => {
    expect(cleanPostText("see https://t.co/abc123 for more")).toBe(
      "see https://t.co/abc123 for more",
    );
  });

  it("collapses whitespace and trims", () => {
    expect(cleanPostText("  spread   out \n line ")).toBe("spread out line");
  });
});

describe("toProfile", () => {
  it("maps the user payload", () => {
    expect(toProfile(USER)).toEqual({
      id: "10017528",
      username: "dmnktoe",
      name: "Sample User 96991",
      avatar: "https://example.com/images/sample-avatar-96991.jpg",
    });
  });

  it("falls back to the username when the display name is blank", () => {
    expect(toProfile({ ...USER, name: "   " })).toMatchObject({ name: "dmnktoe" });
    expect(toProfile({ ...USER, name: undefined })).toMatchObject({ name: "dmnktoe" });
  });

  it("nulls a missing avatar", () => {
    expect(toProfile({ ...USER, avatar: "" })).toMatchObject({ avatar: null });
  });

  it("returns null without an id or username", () => {
    expect(toProfile({ ...USER, id: undefined })).toBeNull();
    expect(toProfile({ ...USER, username: undefined })).toBeNull();
    expect(toProfile(undefined)).toBeNull();
  });
});

describe("toPost", () => {
  it("builds the status url from the author and id", () => {
    expect(toPost(TWEET, "fallback")).toEqual({
      id: "5001591756625130239",
      text: "Sample post text 83969 for documentation.",
      url: "https://x.com/dmnktoe/status/5001591756625130239",
      createdAt: "2025-10-02T05:47:48.000Z",
      hasMedia: false,
      isSensitive: false,
      isQuote: false,
    });
  });

  it("uses the looked-up username when the tweet carries no author", () => {
    expect(toPost({ ...TWEET, author: undefined }, "dmnktoe")).toMatchObject({
      url: "https://x.com/dmnktoe/status/5001591756625130239",
    });
  });

  it("skips retweets because they are not the author's words", () => {
    expect(toPost({ ...TWEET, type: "retweet" }, "dmnktoe")).toBeNull();
  });

  it("keeps quote posts and flags them", () => {
    expect(toPost({ ...TWEET, type: "quote" }, "dmnktoe")).toMatchObject({ isQuote: true });
  });

  it("flags media and sensitive posts", () => {
    expect(toPost({ ...TWEET, media: [{ type: "photo" }] }, "dmnktoe")).toMatchObject({
      hasMedia: true,
    });
    expect(toPost({ ...TWEET, possiblySensitive: true }, "dmnktoe")).toMatchObject({
      isSensitive: true,
    });
  });

  it("keeps a text-less post when it carries media", () => {
    const post = toPost({ ...TWEET, text: "https://t.co/abc123", media: [{}] }, "dmnktoe");
    expect(post).toMatchObject({ text: "", hasMedia: true });
  });

  it("skips a post with neither text nor media", () => {
    expect(toPost({ ...TWEET, text: "  " }, "dmnktoe")).toBeNull();
    expect(toPost({ ...TWEET, id: undefined }, "dmnktoe")).toBeNull();
  });
});

describe("fetchXTimeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("looks the user up, then reads the timeline by id", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ data: USER }))
      .mockResolvedValueOnce(jsonResponse({ data: [TWEET] }));

    const result = await fetchXTimeline(REQUEST);

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "https://api.tweetapi.com/tw-v2/user/by-username?username=dmnktoe",
      expect.objectContaining({
        headers: { "X-API-Key": "secret", Accept: "application/json" },
      }),
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "https://api.tweetapi.com/tw-v2/user/tweets?userId=10017528",
      expect.objectContaining({
        headers: { "X-API-Key": "secret", Accept: "application/json" },
      }),
    );
    expect(result).toMatchObject({
      ok: true,
      timeline: { profile: { username: "dmnktoe" }, posts: [{ id: TWEET.id }] },
    });
  });

  it("strips a trailing slash from the api url", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ data: USER }))
      .mockResolvedValueOnce(jsonResponse({ data: [TWEET] }));

    await fetchXTimeline({ ...REQUEST, apiUrl: "https://api.tweetapi.com/tw-v2/" });

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "https://api.tweetapi.com/tw-v2/user/by-username?username=dmnktoe",
      expect.anything(),
    );
  });

  it("orders posts newest first and honours the limit", async () => {
    const older = { ...TWEET, id: "1", createdAt: "2020-01-01T00:00:00.000Z" };
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ data: USER }))
      .mockResolvedValueOnce(jsonResponse({ data: [older, TWEET] }));

    const result = await fetchXTimeline({ ...REQUEST, limit: 1 });

    expect(result).toMatchObject({ ok: true });
    if (result.ok) {
      expect(result.timeline.posts.map((post) => post.id)).toEqual([TWEET.id]);
    }
  });

  it("drops retweets from the timeline", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ data: USER }))
      .mockResolvedValueOnce(jsonResponse({ data: [{ ...TWEET, type: "retweet" }] }));

    const result = await fetchXTimeline(REQUEST);

    expect(result).toMatchObject({ ok: true });
    if (result.ok) {
      expect(result.timeline.posts).toEqual([]);
    }
  });

  it("surfaces a failed lookup without reading the timeline", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ statusCode: 404 }, false, 404));

    const result = await fetchXTimeline(REQUEST);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ ok: false, status: 404 });
  });

  it("surfaces a rate-limited timeline request", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ data: USER }))
      .mockResolvedValueOnce(jsonResponse({ statusCode: 429 }, false, 429));

    const result = await fetchXTimeline(REQUEST);

    expect(result).toMatchObject({ ok: false, status: 429 });
    if (!result.ok) {
      expect(result.message).toContain("rate limit");
    }
  });

  it("fails when the lookup carries no usable user", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: {} }));

    const result = await fetchXTimeline(REQUEST);

    expect(result).toEqual({
      ok: false,
      status: 502,
      message: "Unexpected response from the TweetAPI user endpoint.",
    });
  });

  it("fails when the timeline payload is not a list", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ data: USER }))
      .mockResolvedValueOnce(jsonResponse({ data: { error: "nope" } }));

    const result = await fetchXTimeline(REQUEST);

    expect(result).toEqual({
      ok: false,
      status: 502,
      message: "Unexpected response from the TweetAPI tweets endpoint.",
    });
  });

  it("reports a timeout as a 504", async () => {
    mockFetch.mockRejectedValueOnce(new DOMException("aborted", "AbortError"));

    const result = await fetchXTimeline(REQUEST);

    expect(result).toEqual({ ok: false, status: 504, message: "TweetAPI request timed out." });
  });
});
