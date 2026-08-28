// @vitest-environment node
vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getConfig, enforceRateLimit, fetchDiscogsCollection, isDiscogsUsername } = vi.hoisted(
  () => ({
    getConfig: vi.fn(),
    enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
    fetchDiscogsCollection: vi.fn(),
    isDiscogsUsername: vi.fn(() => true),
  }),
);

vi.mock("@/lib/queries/config", () => ({ getConfig }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));
vi.mock("@/lib/integrations/discogs", () => ({ fetchDiscogsCollection, isDiscogsUsername }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import type { NextRequest } from "next/server";

import { GET } from "./route";

const request = {} as NextRequest;

beforeEach(() => {
  vi.clearAllMocks();
  enforceRateLimit.mockResolvedValue(null);
  isDiscogsUsername.mockReturnValue(true);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/discogs", () => {
  it("returns the releases when configured", async () => {
    getConfig.mockResolvedValueOnce({ discogs_username: "user" });
    fetchDiscogsCollection.mockResolvedValueOnce({
      ok: true,
      releases: [{ title: "Endtroducing....." }],
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      releases: [{ title: "Endtroducing....." }],
    });
    expect(fetchDiscogsCollection).toHaveBeenCalledWith("user");
  });

  it("caches the response at the edge", async () => {
    getConfig.mockResolvedValueOnce({ discogs_username: "user" });
    fetchDiscogsCollection.mockResolvedValueOnce({ ok: true, releases: [] });

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toContain("s-maxage=900");
  });

  it("keeps draft responses out of shared caches", async () => {
    const { draftMode } = await import("next/headers");
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: true } as never);
    getConfig.mockResolvedValueOnce({ discogs_username: "user" });
    fetchDiscogsCollection.mockResolvedValueOnce({ ok: true, releases: [] });

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
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
    getConfig.mockResolvedValueOnce({ discogs_username: "../admin" });
    isDiscogsUsername.mockReturnValue(false);

    const response = await GET(request);

    expect(response.status).toBe(501);
    expect(fetchDiscogsCollection).not.toHaveBeenCalled();
  });

  it("returns 503 when the config story cannot be read", async () => {
    getConfig.mockResolvedValueOnce(null);

    const response = await GET(request);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: "config_unavailable" });
  });

  it("short-circuits when rate limited", async () => {
    enforceRateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }) as never);

    const response = await GET(request);

    expect(response.status).toBe(429);
    expect(getConfig).not.toHaveBeenCalled();
  });

  it("propagates the upstream status when the collection fetch fails", async () => {
    getConfig.mockResolvedValueOnce({ discogs_username: "user" });
    fetchDiscogsCollection.mockResolvedValueOnce({ ok: false, status: 404, message: "private" });

    const response = await GET(request);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ message: "private" });
  });

  it("reports unexpected errors and returns a 500", async () => {
    getConfig.mockResolvedValueOnce({ discogs_username: "user" });
    fetchDiscogsCollection.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
