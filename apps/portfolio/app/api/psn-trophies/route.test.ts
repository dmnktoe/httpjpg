// @vitest-environment node
const mockEnv = vi.hoisted(() => ({ PSN_NPSSO: "npsso-token" as string | undefined }));

vi.mock("@httpjpg/env", () => ({ env: mockEnv }));

vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getConfig, enforceRateLimit, fetchRecentTrophies, isPsnUsername } = vi.hoisted(() => ({
  getConfig: vi.fn(),
  enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
  fetchRecentTrophies: vi.fn(),
  isPsnUsername: vi.fn(() => true),
}));

vi.mock("@/lib/queries/config", () => ({ getConfig }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));
vi.mock("@/lib/integrations/psn-trophies", () => ({ fetchRecentTrophies, isPsnUsername }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import type { NextRequest } from "next/server";

import { GET } from "./route";

const request = {} as NextRequest;

beforeEach(() => {
  vi.clearAllMocks();
  enforceRateLimit.mockResolvedValue(null);
  mockEnv.PSN_NPSSO = "npsso-token";
  isPsnUsername.mockReturnValue(true);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/psn-trophies", () => {
  it("returns 501 when PSN_NPSSO is not configured", async () => {
    mockEnv.PSN_NPSSO = undefined;

    const response = await GET(request);

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toMatchObject({ error: "PSN not configured" });
    expect(fetchRecentTrophies).not.toHaveBeenCalled();
  });

  it("returns trophies with a cache header", async () => {
    getConfig.mockResolvedValueOnce({ psn_username: "player" });
    fetchRecentTrophies.mockResolvedValueOnce({
      ok: true,
      trophies: [{ name: "Platinum" }],
      avatar: "https://example.com/a.png",
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(
      "public, s-maxage=300, stale-while-revalidate=600",
    );
    await expect(response.json()).resolves.toEqual({
      trophies: [{ name: "Platinum" }],
      avatar: "https://example.com/a.png",
    });
    expect(fetchRecentTrophies).toHaveBeenCalledWith("npsso-token", "player");
  });

  it("ignores a malformed username from the Storyblok config", async () => {
    getConfig.mockResolvedValueOnce({ psn_username: "bad name" });
    isPsnUsername.mockReturnValue(false);
    fetchRecentTrophies.mockResolvedValueOnce({ ok: true, trophies: [] });

    await GET(request);

    expect(fetchRecentTrophies).toHaveBeenCalledWith("npsso-token", undefined);
  });

  it("falls back to no username when the config story cannot be read", async () => {
    getConfig.mockResolvedValueOnce(null);
    fetchRecentTrophies.mockResolvedValueOnce({ ok: true, trophies: [] });

    await GET(request);

    expect(fetchRecentTrophies).toHaveBeenCalledWith("npsso-token", undefined);
  });

  it("falls back to no username when the config story is empty", async () => {
    getConfig.mockResolvedValueOnce({});
    fetchRecentTrophies.mockResolvedValueOnce({ ok: true, trophies: [] });

    await GET(request);

    expect(fetchRecentTrophies).toHaveBeenCalledWith("npsso-token", undefined);
  });

  it("propagates the upstream status and reason when the trophy fetch fails", async () => {
    getConfig.mockResolvedValueOnce({});
    fetchRecentTrophies.mockResolvedValueOnce({
      ok: false,
      status: 429,
      reason: "upstream",
      message: "rate limited",
      reportable: false,
    });

    const response = await GET(request);

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "PSN trophies unavailable",
      reason: "upstream",
    });
    expect(captureServerException).not.toHaveBeenCalled();
  });

  it("reports a reportable failure to Sentry tagged with its reason", async () => {
    const error = new Error("NPSSO rejected");
    getConfig.mockResolvedValueOnce({});
    fetchRecentTrophies.mockResolvedValueOnce({
      ok: false,
      status: 503,
      reason: "auth",
      message: "NPSSO rejected",
      error,
      reportable: true,
    });

    const response = await GET(request);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "PSN trophies unavailable",
      reason: "auth",
    });
    expect(captureServerException).toHaveBeenCalledWith(error, {
      tags: { route: "psn-trophies", reason: "auth" },
    });
  });

  it("reports unexpected errors and returns a 500", async () => {
    getConfig.mockResolvedValueOnce({});
    fetchRecentTrophies.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Failed to fetch PSN trophies" });
    expect(captureServerException).toHaveBeenCalledOnce();
  });

  it("keeps draft responses out of shared caches", async () => {
    const { draftMode } = await import("next/headers");
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: true } as never);
    getConfig.mockResolvedValueOnce({ psn_username: "dmnktoe" });
    fetchRecentTrophies.mockResolvedValueOnce({ ok: true, trophies: [], avatar: null });

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("short-circuits when rate limited", async () => {
    enforceRateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }) as never);

    const response = await GET(request);

    expect(response.status).toBe(429);
    expect(fetchRecentTrophies).not.toHaveBeenCalled();
  });
});
