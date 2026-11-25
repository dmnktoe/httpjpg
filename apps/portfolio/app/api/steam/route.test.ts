// @vitest-environment node
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: async () => undefined,
}));
const { env } = vi.hoisted(() => ({
  env: { STEAM_API_KEY: "secret" } as Record<string, string | undefined>,
}));

vi.mock("@httpjpg/env", () => ({ env }));

vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getConfig, fetchSteamStatus, isSteamId, enforceRateLimit } = vi.hoisted(() => ({
  getConfig: vi.fn(),
  fetchSteamStatus: vi.fn(),
  isSteamId: vi.fn(() => true),
  enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
}));

vi.mock("@/lib/queries/config", () => ({ getConfig }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));
vi.mock("@/lib/integrations/steam", () => ({ fetchSteamStatus, isSteamId }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import type { NextRequest } from "next/server";

import { GET } from "./route";

const request = {} as NextRequest;

beforeEach(() => {
  vi.clearAllMocks();
  env.STEAM_API_KEY = "secret";
  isSteamId.mockReturnValue(true);
  enforceRateLimit.mockResolvedValue(null);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/steam", () => {
  it("returns the games when configured", async () => {
    getConfig.mockResolvedValueOnce({ steam_id: "76561197960435530" });
    fetchSteamStatus.mockResolvedValueOnce({
      ok: true,
      status: { profile: { name: "dom" }, games: [] },
    });

    const response = await GET(request);

    expect(fetchSteamStatus).toHaveBeenCalledWith("76561197960435530", "secret");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ profile: { name: "dom" }, games: [] });
  });

  it("caches the response at the edge for five minutes", async () => {
    getConfig.mockResolvedValueOnce({ steam_id: "76561197960435530" });
    fetchSteamStatus.mockResolvedValueOnce({ ok: true, status: { profile: {}, games: [] } });

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300");
  });

  it("returns 501 without an api key, before touching Storyblok", async () => {
    env.STEAM_API_KEY = undefined;

    const response = await GET(request);

    expect(response.status).toBe(501);
    expect(getConfig).not.toHaveBeenCalled();
  });

  it("returns 501 when no username is configured", async () => {
    getConfig.mockResolvedValueOnce({});

    const response = await GET(request);

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toMatchObject({ error: "not_configured" });
  });

  it("ignores a malformed username from config", async () => {
    getConfig.mockResolvedValueOnce({ steam_id: "dom" });
    isSteamId.mockReturnValue(false);

    const response = await GET(request);

    expect(response.status).toBe(501);
    expect(fetchSteamStatus).not.toHaveBeenCalled();
  });

  it("returns 503 when the config story cannot be read", async () => {
    getConfig.mockResolvedValueOnce(null);

    const response = await GET(request);

    expect(response.status).toBe(503);
  });

  it("propagates an upstream failure", async () => {
    getConfig.mockResolvedValueOnce({ steam_id: "76561197960435530" });
    fetchSteamStatus.mockResolvedValueOnce({ ok: false, status: 403, message: "bad key" });

    const response = await GET(request);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ message: "bad key" });
  });

  it("reports unexpected errors and returns a 500", async () => {
    getConfig.mockResolvedValueOnce({ steam_id: "76561197960435530" });
    fetchSteamStatus.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
