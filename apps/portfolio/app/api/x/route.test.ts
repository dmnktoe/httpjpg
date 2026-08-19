// @vitest-environment node
const { env } = vi.hoisted(() => ({
  env: {
    TWEETAPI_KEY: "secret",
    TWEETAPI_API_URL: "https://api.tweetapi.com/tw-v2",
  } as Record<string, string | undefined>,
}));

vi.mock("@httpjpg/env", () => ({ env }));

vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getStory, getStoryblokApi, fetchXTimeline, isXUsername, enforceRateLimit } = vi.hoisted(
  () => ({
    getStory: vi.fn(),
    getStoryblokApi: vi.fn(),
    fetchXTimeline: vi.fn(),
    isXUsername: vi.fn(() => true),
    enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
  }),
);

vi.mock("@httpjpg/storyblok-api", () => ({ getStoryblokApi }));

vi.mock("@/lib/integrations/x-posts", () => ({ fetchXTimeline, isXUsername }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import type { NextRequest } from "next/server";

import { API_ERROR } from "@/lib/api/errors";

import { GET } from "./route";

const request = {} as NextRequest;

beforeEach(() => {
  vi.clearAllMocks();
  getStoryblokApi.mockReturnValue({ getStory });
  env.TWEETAPI_KEY = "secret";
  isXUsername.mockReturnValue(true);
  enforceRateLimit.mockResolvedValue(null);
});

describe("GET /api/x", () => {
  it("returns the timeline when configured", async () => {
    getStory.mockResolvedValueOnce({ content: { x_username: "dmnktoe" } });
    fetchXTimeline.mockResolvedValueOnce({
      ok: true,
      timeline: { profile: { username: "dmnktoe" }, posts: [{ text: "Hello" }] },
    });

    const response = await GET(request);

    expect(fetchXTimeline).toHaveBeenCalledWith({
      apiUrl: "https://api.tweetapi.com/tw-v2",
      apiKey: "secret",
      username: "dmnktoe",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      profile: { username: "dmnktoe" },
      posts: [{ text: "Hello" }],
    });
  });

  it("caches the response for an hour", async () => {
    getStory.mockResolvedValueOnce({ content: { x_username: "dmnktoe" } });
    fetchXTimeline.mockResolvedValueOnce({
      ok: true,
      timeline: { profile: {}, posts: [] },
    });

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");
  });

  it("passes the rate limiter's response straight through", async () => {
    const limited = new Response(null, { status: 429 });
    enforceRateLimit.mockResolvedValueOnce(limited as never);

    const response = await GET(request);

    expect(response.status).toBe(429);
    expect(getStory).not.toHaveBeenCalled();
  });

  it("returns 501 without an api key, before touching Storyblok", async () => {
    env.TWEETAPI_KEY = undefined;

    const response = await GET(request);

    expect(response.status).toBe(501);
    expect(getStory).not.toHaveBeenCalled();
  });

  it("returns 501 when no username is configured", async () => {
    getStory.mockResolvedValueOnce({ content: {} });

    const response = await GET(request);

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toMatchObject({
      error: API_ERROR.notConfigured,
    });
  });

  it("ignores a malformed username from config", async () => {
    getStory.mockResolvedValueOnce({ content: { x_username: "../admin" } });
    isXUsername.mockReturnValue(false);

    const response = await GET(request);

    expect(response.status).toBe(501);
    expect(fetchXTimeline).not.toHaveBeenCalled();
  });

  it("returns 503 when the config story cannot be read", async () => {
    getStory.mockRejectedValueOnce(new Error("storyblok down"));

    const response = await GET(request);

    expect(response.status).toBe(503);
  });

  it("propagates a rate limit from TweetAPI", async () => {
    getStory.mockResolvedValueOnce({ content: { x_username: "dmnktoe" } });
    fetchXTimeline.mockResolvedValueOnce({ ok: false, status: 429, message: "rate limit" });

    const response = await GET(request);

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({ message: "rate limit" });
  });

  it("reports unexpected errors and returns a 500", async () => {
    getStory.mockResolvedValueOnce({ content: { x_username: "dmnktoe" } });
    fetchXTimeline.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });

  it("reads the config through the request's draft mode", async () => {
    const { draftMode } = await import("next/headers");
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: true } as never);
    getStory.mockResolvedValueOnce({ content: { x_username: "dmnktoe" } });

    await GET(request);

    expect(getStoryblokApi).toHaveBeenCalledWith({ draftMode: true });
  });
});
