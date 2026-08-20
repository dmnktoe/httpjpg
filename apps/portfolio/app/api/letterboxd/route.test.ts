// @vitest-environment node
vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getConfig, enforceRateLimit, fetchLetterboxdFilms, isLetterboxdUsername } = vi.hoisted(
  () => ({
    getConfig: vi.fn(),
    enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
    fetchLetterboxdFilms: vi.fn(),
    isLetterboxdUsername: vi.fn(() => true),
  }),
);

vi.mock("@/lib/queries/config", () => ({ getConfig }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));
vi.mock("@/lib/integrations/letterboxd", () => ({ fetchLetterboxdFilms, isLetterboxdUsername }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import type { NextRequest } from "next/server";

import { GET } from "./route";

const request = {} as NextRequest;

beforeEach(() => {
  vi.clearAllMocks();
  enforceRateLimit.mockResolvedValue(null);
  isLetterboxdUsername.mockReturnValue(true);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/letterboxd", () => {
  it("returns films when configured", async () => {
    getConfig.mockResolvedValueOnce({ letterboxd_username: "user" });
    fetchLetterboxdFilms.mockResolvedValueOnce({ ok: true, films: [{ title: "Dune" }] });

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ films: [{ title: "Dune" }] });
  });

  it("caches the response at the edge", async () => {
    getConfig.mockResolvedValueOnce({ letterboxd_username: "user" });
    fetchLetterboxdFilms.mockResolvedValueOnce({ ok: true, films: [] });

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300");
  });

  it("returns 501 when no username is configured", async () => {
    getConfig.mockResolvedValueOnce({});

    const response = await GET(request);

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toMatchObject({
      error: "Letterboxd username not configured",
    });
  });

  it("ignores a malformed username from config", async () => {
    getConfig.mockResolvedValueOnce({ letterboxd_username: "bad name" });
    isLetterboxdUsername.mockReturnValue(false);

    const response = await GET(request);

    expect(response.status).toBe(501);
    expect(fetchLetterboxdFilms).not.toHaveBeenCalled();
  });

  it("returns 503 when the config story cannot be read", async () => {
    getConfig.mockResolvedValueOnce(null);

    const response = await GET(request);

    expect(response.status).toBe(503);
  });

  it("short-circuits when rate limited", async () => {
    enforceRateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }) as never);

    const response = await GET(request);

    expect(response.status).toBe(429);
    expect(getConfig).not.toHaveBeenCalled();
  });

  it("propagates the upstream status when the RSS fetch fails", async () => {
    getConfig.mockResolvedValueOnce({ letterboxd_username: "user" });
    fetchLetterboxdFilms.mockResolvedValueOnce({ ok: false, status: 503, message: "down" });

    const response = await GET(request);

    expect(response.status).toBe(503);
  });

  it("reports unexpected errors and returns a 500", async () => {
    getConfig.mockResolvedValueOnce({ letterboxd_username: "user" });
    fetchLetterboxdFilms.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
