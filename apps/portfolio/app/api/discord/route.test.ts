// @vitest-environment node
vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getStory, fetchDiscordPresence, isDiscordUserId, enforceRateLimit } = vi.hoisted(() => ({
  getStory: vi.fn(),
  fetchDiscordPresence: vi.fn(),
  isDiscordUserId: vi.fn(() => true),
  enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
}));

vi.mock("@httpjpg/storyblok-api", () => ({
  getStoryblokApi: () => ({ getStory }),
}));

vi.mock("@/lib/integrations/discord", () => ({ fetchDiscordPresence, isDiscordUserId }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));

import type { NextRequest } from "next/server";

import { GET } from "./route";

const request = {} as NextRequest;

beforeEach(() => {
  vi.clearAllMocks();
  isDiscordUserId.mockReturnValue(true);
});

describe("GET /api/discord", () => {
  it("returns the presence payload when configured", async () => {
    getStory.mockResolvedValueOnce({ content: { discord_user_id: "123" } });
    fetchDiscordPresence.mockResolvedValueOnce({ ok: true, presence: { status: "online" } });

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "online" });
  });

  it("returns 500 when no user id is configured", async () => {
    getStory.mockResolvedValueOnce({ content: {} });

    const response = await GET(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      error: "Discord User ID not configured",
    });
  });

  it("propagates the upstream status when Lanyard is unavailable", async () => {
    getStory.mockResolvedValueOnce({ content: { discord_user_id: "123" } });
    fetchDiscordPresence.mockResolvedValueOnce({ ok: false, status: 404, message: "not found" });

    const response = await GET(request);

    expect(response.status).toBe(404);
  });

  it("short-circuits when rate limited", async () => {
    const limited = new Response(null, { status: 429 });
    enforceRateLimit.mockResolvedValueOnce(limited);

    const response = await GET(request);

    expect(response.status).toBe(429);
    expect(getStory).not.toHaveBeenCalled();
  });
});
