// @vitest-environment node
const mockEnv = vi.hoisted(() => ({ PSN_NPSSO: "npsso-token" as string | undefined }));

vi.mock("@httpjpg/env", () => ({ env: mockEnv }));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getStory, fetchRecentTrophies, isPsnUsername } = vi.hoisted(() => ({
  getStory: vi.fn(),
  fetchRecentTrophies: vi.fn(),
  isPsnUsername: vi.fn(() => true),
}));

vi.mock("@httpjpg/storyblok-api", () => ({ getStoryblokApi: () => ({ getStory }) }));

vi.mock("@/lib/integrations/psn-trophies", () => ({ fetchRecentTrophies, isPsnUsername }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  mockEnv.PSN_NPSSO = "npsso-token";
  isPsnUsername.mockReturnValue(true);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/psn-trophies", () => {
  it("returns 500 when PSN_NPSSO is not configured", async () => {
    mockEnv.PSN_NPSSO = undefined;

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({ error: "PSN not configured" });
    expect(fetchRecentTrophies).not.toHaveBeenCalled();
  });

  it("returns trophies with a cache header", async () => {
    getStory.mockResolvedValueOnce({ content: { psn_username: "player" } });
    fetchRecentTrophies.mockResolvedValueOnce({
      ok: true,
      trophies: [{ name: "Platinum" }],
      avatar: "https://example.com/a.png",
    });

    const response = await GET();

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
    getStory.mockResolvedValueOnce({ content: { psn_username: "bad name" } });
    isPsnUsername.mockReturnValue(false);
    fetchRecentTrophies.mockResolvedValueOnce({ ok: true, trophies: [] });

    await GET();

    expect(fetchRecentTrophies).toHaveBeenCalledWith("npsso-token", undefined);
  });

  it("falls back to no username when the config story cannot be read", async () => {
    getStory.mockRejectedValueOnce(new Error("storyblok down"));
    fetchRecentTrophies.mockResolvedValueOnce({ ok: true, trophies: [] });

    await GET();

    expect(fetchRecentTrophies).toHaveBeenCalledWith("npsso-token", undefined);
  });

  it("falls back to no username when the config story has no content", async () => {
    getStory.mockResolvedValueOnce(undefined);
    fetchRecentTrophies.mockResolvedValueOnce({ ok: true, trophies: [] });

    await GET();

    expect(fetchRecentTrophies).toHaveBeenCalledWith("npsso-token", undefined);
  });

  it("propagates the upstream status when the trophy fetch fails", async () => {
    getStory.mockResolvedValueOnce({ content: {} });
    fetchRecentTrophies.mockResolvedValueOnce({ ok: false, status: 429, message: "rate limited" });

    const response = await GET();

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "PSN trophies unavailable",
      message: "rate limited",
    });
  });

  it("reports unexpected errors and returns a 500", async () => {
    getStory.mockResolvedValueOnce({ content: {} });
    fetchRecentTrophies.mockRejectedValueOnce(new Error("boom"));

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Failed to fetch PSN trophies" });
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
