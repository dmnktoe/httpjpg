// @vitest-environment node
import type { NextRequest } from "next/server";

vi.mock("@httpjpg/env", () => ({
  env: {
    SPOTIFY_CLIENT_ID: "id",
    SPOTIFY_CLIENT_SECRET: "secret",
    SPOTIFY_REFRESH_TOKEN: "refresh",
  },
}));

vi.mock("@httpjpg/observability/sentry/edge.ts", () => ({
  captureEdgeException: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn(async () => null),
}));

const { getAccessToken, getCurrentlyPlaying } = vi.hoisted(() => ({
  getAccessToken: vi.fn(async () => "token"),
  getCurrentlyPlaying: vi.fn(),
}));

vi.mock("@httpjpg/spotify", async (importActual) => {
  const actual = await importActual<typeof import("@httpjpg/spotify")>();
  return {
    ...actual,
    getAccessToken,
    getCurrentlyPlaying,
  };
});

import { captureEdgeException } from "@httpjpg/observability/sentry/edge.ts";
import { SpotifyForbiddenError } from "@httpjpg/spotify";

import { GET, OPTIONS } from "./route";

const request = {} as NextRequest;

describe("GET /api/spotify/now-playing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the track payload on success", async () => {
    getCurrentlyPlaying.mockResolvedValueOnce({ title: "Song", isPlaying: true });

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: { title: "Song", isPlaying: true } });
    expect(captureEdgeException).not.toHaveBeenCalled();
  });

  it("maps a missing Premium account to a 403 without reporting to Sentry", async () => {
    getCurrentlyPlaying.mockRejectedValueOnce(new SpotifyForbiddenError());

    const response = await GET(request);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: "premium_missing" });
    expect(captureEdgeException).not.toHaveBeenCalled();
  });

  it("reports unexpected errors and returns a 500", async () => {
    getCurrentlyPlaying.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({ error: "internal_error" });
    expect(captureEdgeException).toHaveBeenCalledOnce();
  });

  it("answers CORS preflight requests", async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS");
  });
});
