// @vitest-environment node
vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getStory, getStoryblokApi, fetchDiscordPresence, isDiscordUserId, enforceRateLimit } =
  vi.hoisted(() => ({
    getStory: vi.fn(),
    getStoryblokApi: vi.fn(),
    fetchDiscordPresence: vi.fn(),
    isDiscordUserId: vi.fn(() => true),
    enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
  }));

vi.mock("@httpjpg/storyblok-api", () => ({ getStoryblokApi }));

vi.mock("@/lib/integrations/discord", () => ({ fetchDiscordPresence, isDiscordUserId }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));

import type { NextRequest } from "next/server";

import { API_ERROR } from "@/lib/api/errors";

import { GET } from "./route";

const request = {} as NextRequest;

beforeEach(() => {
  vi.clearAllMocks();
  getStoryblokApi.mockReturnValue({ getStory });
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

  it("returns 501 when no user id is configured", async () => {
    getStory.mockResolvedValueOnce({ content: {} });

    const response = await GET(request);

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toMatchObject({
      error: API_ERROR.notConfigured,
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

  it("reads the config through the request's draft mode", async () => {
    const { draftMode } = await import("next/headers");
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: true } as never);
    getStory.mockResolvedValueOnce({ content: { discord_user_id: "123" } });

    await GET(request);

    expect(getStoryblokApi).toHaveBeenCalledWith({ draftMode: true });
  });
});
