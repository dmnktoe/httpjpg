// @vitest-environment node
vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getStory, getStoryblokApi, fetchLetterboxdFilms, isLetterboxdUsername } = vi.hoisted(
  () => ({
    getStory: vi.fn(),
    getStoryblokApi: vi.fn(),
    fetchLetterboxdFilms: vi.fn(),
    isLetterboxdUsername: vi.fn(() => true),
  }),
);

vi.mock("@httpjpg/storyblok-api", () => ({ getStoryblokApi }));

vi.mock("@/lib/integrations/letterboxd", () => ({ fetchLetterboxdFilms, isLetterboxdUsername }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { NextRequest } from "next/server";

import { API_ERROR } from "@/lib/api/errors";

import { GET } from "./route";

const request = new NextRequest("http://localhost/api/letterboxd");

beforeEach(() => {
  vi.clearAllMocks();
  getStoryblokApi.mockReturnValue({ getStory });
  isLetterboxdUsername.mockReturnValue(true);
});

describe("GET /api/letterboxd", () => {
  it("returns films when configured", async () => {
    getStory.mockResolvedValueOnce({ content: { letterboxd_username: "user" } });
    fetchLetterboxdFilms.mockResolvedValueOnce({ ok: true, films: [{ title: "Dune" }] });

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ films: [{ title: "Dune" }] });
  });

  it("returns 501 when no username is configured", async () => {
    getStory.mockResolvedValueOnce({ content: {} });

    const response = await GET(request);

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toMatchObject({
      error: API_ERROR.notConfigured,
    });
  });

  it("ignores a malformed username from config", async () => {
    getStory.mockResolvedValueOnce({ content: { letterboxd_username: "bad name" } });
    isLetterboxdUsername.mockReturnValue(false);

    const response = await GET(request);

    expect(response.status).toBe(501);
  });

  it("propagates the upstream status when the RSS fetch fails", async () => {
    getStory.mockResolvedValueOnce({ content: { letterboxd_username: "user" } });
    fetchLetterboxdFilms.mockResolvedValueOnce({ ok: false, status: 503, message: "down" });

    const response = await GET(request);

    expect(response.status).toBe(503);
  });

  it("reports unexpected errors and returns a 500", async () => {
    getStory.mockResolvedValueOnce({ content: { letterboxd_username: "user" } });
    fetchLetterboxdFilms.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });

  it("reads the config through the request's draft mode", async () => {
    const { draftMode } = await import("next/headers");
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: true } as never);
    getStory.mockResolvedValueOnce({ content: { letterboxd_username: "user" } });

    await GET(request);

    expect(getStoryblokApi).toHaveBeenCalledWith({ draftMode: true });
  });
});
