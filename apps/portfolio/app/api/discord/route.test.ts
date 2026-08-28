// @vitest-environment node
vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getConfig, enforceRateLimit, fetchDiscordPresence, isDiscordUserId } = vi.hoisted(() => ({
  getConfig: vi.fn(),
  enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
  fetchDiscordPresence: vi.fn(),
  isDiscordUserId: vi.fn(() => true),
}));

vi.mock("@/lib/queries/config", () => ({ getConfig }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));
vi.mock("@/lib/integrations/discord", () => ({ fetchDiscordPresence, isDiscordUserId }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import type { NextRequest } from "next/server";

import { GET } from "./route";

const request = {} as NextRequest;

beforeEach(() => {
  vi.clearAllMocks();
  enforceRateLimit.mockResolvedValue(null);
  isDiscordUserId.mockReturnValue(true);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/discord", () => {
  it("returns the presence payload when configured", async () => {
    getConfig.mockResolvedValueOnce({ discord_user_id: "123" });
    fetchDiscordPresence.mockResolvedValueOnce({ ok: true, presence: { status: "online" } });

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "online" });
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=30");
  });

  it("returns 501 when no user id is configured", async () => {
    getConfig.mockResolvedValueOnce({});

    const response = await GET(request);

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toMatchObject({
      error: "not_configured",
    });
  });

  it("returns 503 when the config story cannot be read", async () => {
    getConfig.mockResolvedValueOnce(null);

    const response = await GET(request);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: "config_unavailable" });
  });

  it("ignores a malformed user id from config", async () => {
    getConfig.mockResolvedValueOnce({ discord_user_id: "not-an-id" });
    isDiscordUserId.mockReturnValue(false);

    const response = await GET(request);

    expect(response.status).toBe(501);
    expect(fetchDiscordPresence).not.toHaveBeenCalled();
  });

  it("propagates the upstream status when Lanyard is unavailable", async () => {
    getConfig.mockResolvedValueOnce({ discord_user_id: "123" });
    fetchDiscordPresence.mockResolvedValueOnce({ ok: false, status: 404, message: "not found" });

    const response = await GET(request);

    expect(response.status).toBe(404);
  });

  it("short-circuits when rate limited", async () => {
    enforceRateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }) as never);

    const response = await GET(request);

    expect(response.status).toBe(429);
    expect(getConfig).not.toHaveBeenCalled();
  });

  it("reports unexpected errors as a 500 without leaking the message", async () => {
    getConfig.mockResolvedValueOnce({ discord_user_id: "123" });
    fetchDiscordPresence.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "internal_error",
      message: "Failed to fetch Discord status",
    });
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
