// @vitest-environment node
const mockEnv = vi.hoisted(() => ({ PSN_NPSSO: "npsso-token" as string | undefined }));

vi.mock("@httpjpg/env", () => ({ env: mockEnv }));

vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getStory, getStoryblokApi, fetchRecentTrophies, isPsnUsername } = vi.hoisted(() => ({
  getStory: vi.fn(),
  getStoryblokApi: vi.fn(),
  fetchRecentTrophies: vi.fn(),
  isPsnUsername: vi.fn(() => true),
}));

vi.mock("@httpjpg/storyblok-api", () => ({ getStoryblokApi }));

vi.mock("@/lib/integrations/psn-trophies", () => ({ fetchRecentTrophies, isPsnUsername }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { NextRequest } from "next/server";

import { API_ERROR } from "@/lib/api/errors";

import { GET } from "./route";

const request = new NextRequest("http://localhost/api/psn-trophies");

beforeEach(() => {
  vi.clearAllMocks();
  getStoryblokApi.mockReturnValue({ getStory });
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
    await expect(response.json()).resolves.toMatchObject({ error: API_ERROR.notConfigured });
    expect(fetchRecentTrophies).not.toHaveBeenCalled();
  });

  it("returns trophies with a cache header", async () => {
    getStory.mockResolvedValueOnce({ content: { psn_username: "player" } });
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
    getStory.mockResolvedValueOnce({ content: { psn_username: "bad name" } });
    isPsnUsername.mockReturnValue(false);
    fetchRecentTrophies.mockResolvedValueOnce({ ok: true, trophies: [] });

    await GET(request);

    expect(fetchRecentTrophies).toHaveBeenCalledWith("npsso-token", undefined);
  });

  it("falls back to no username when the config story cannot be read", async () => {
    getStory.mockRejectedValueOnce(new Error("storyblok down"));
    fetchRecentTrophies.mockResolvedValueOnce({ ok: true, trophies: [] });

    await GET(request);

    expect(fetchRecentTrophies).toHaveBeenCalledWith("npsso-token", undefined);
  });

  it("falls back to no username when the config story has no content", async () => {
    getStory.mockResolvedValueOnce(undefined);
    fetchRecentTrophies.mockResolvedValueOnce({ ok: true, trophies: [] });

    await GET(request);

    expect(fetchRecentTrophies).toHaveBeenCalledWith("npsso-token", undefined);
  });

  it("propagates the upstream status and reason when the trophy fetch fails", async () => {
    getStory.mockResolvedValueOnce({ content: {} });
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
      error: API_ERROR.upstream,
      message: "rate limited",
      reason: "upstream",
    });
    expect(captureServerException).not.toHaveBeenCalled();
  });

  it("reports a reportable failure to Sentry tagged with its reason", async () => {
    const error = new Error("NPSSO rejected");
    getStory.mockResolvedValueOnce({ content: {} });
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
      error: API_ERROR.upstream,
      message: "NPSSO rejected",
      reason: "auth",
    });
    expect(captureServerException).toHaveBeenCalledWith(error, {
      tags: { route: "psn-trophies", reason: "auth" },
    });
  });

  it("reports unexpected errors and returns a 500", async () => {
    getStory.mockResolvedValueOnce({ content: {} });
    fetchRecentTrophies.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: API_ERROR.internal,
      message: "Request failed",
    });
    expect(captureServerException).toHaveBeenCalledOnce();
  });

  it("reads the config through the request's draft mode", async () => {
    const { draftMode } = await import("next/headers");
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: true } as never);
    getStory.mockResolvedValueOnce({ content: { psn_username: "dmnktoe" } });

    await GET(request);

    expect(getStoryblokApi).toHaveBeenCalledWith({ draftMode: true });
  });
});
