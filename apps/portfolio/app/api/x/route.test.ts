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

const { getConfig, fetchXTimeline, isXUsername, enforceRateLimit } = vi.hoisted(() => ({
  getConfig: vi.fn(),
  fetchXTimeline: vi.fn(),
  isXUsername: vi.fn(() => true),
  enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
}));

vi.mock("@/lib/queries/config", () => ({ getConfig }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));
vi.mock("@/lib/integrations/x-posts", () => ({ fetchXTimeline, isXUsername }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import type { NextRequest } from "next/server";

import { GET } from "./route";

const request = {} as NextRequest;

beforeEach(() => {
  vi.clearAllMocks();
  env.TWEETAPI_KEY = "secret";
  isXUsername.mockReturnValue(true);
  enforceRateLimit.mockResolvedValue(null);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/x", () => {
  it("returns the timeline when configured", async () => {
    getConfig.mockResolvedValueOnce({ x_username: "dmnktoe" });
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
    getConfig.mockResolvedValueOnce({ x_username: "dmnktoe" });
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
    expect(getConfig).not.toHaveBeenCalled();
  });

  it("returns 501 without an api key, before touching Storyblok", async () => {
    env.TWEETAPI_KEY = undefined;

    const response = await GET(request);

    expect(response.status).toBe(501);
    expect(getConfig).not.toHaveBeenCalled();
  });

  it("returns 501 when no username is configured", async () => {
    getConfig.mockResolvedValueOnce({});

    const response = await GET(request);

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toMatchObject({
      error: "not_configured",
    });
  });

  it("ignores a malformed username from config", async () => {
    getConfig.mockResolvedValueOnce({ x_username: "../admin" });
    isXUsername.mockReturnValue(false);

    const response = await GET(request);

    expect(response.status).toBe(501);
    expect(fetchXTimeline).not.toHaveBeenCalled();
  });

  it("returns 503 when the config story cannot be read", async () => {
    getConfig.mockResolvedValueOnce(null);

    const response = await GET(request);

    expect(response.status).toBe(503);
  });

  it("propagates a rate limit from TweetAPI", async () => {
    getConfig.mockResolvedValueOnce({ x_username: "dmnktoe" });
    fetchXTimeline.mockResolvedValueOnce({ ok: false, status: 429, message: "rate limit" });

    const response = await GET(request);

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({ message: "rate limit" });
  });

  it("reports unexpected errors and returns a 500", async () => {
    getConfig.mockResolvedValueOnce({ x_username: "dmnktoe" });
    fetchXTimeline.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });

  it("keeps draft responses out of shared caches", async () => {
    const { draftMode } = await import("next/headers");
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: true } as never);
    getConfig.mockResolvedValueOnce({ x_username: "dmnktoe" });
    fetchXTimeline.mockResolvedValueOnce({ ok: true, timeline: { profile: {}, posts: [] } });

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });
});
