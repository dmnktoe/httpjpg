// @vitest-environment node
vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getStory, fetchLetterboxdFilms, isLetterboxdUsername } = vi.hoisted(() => ({
  getStory: vi.fn(),
  fetchLetterboxdFilms: vi.fn(),
  isLetterboxdUsername: vi.fn(() => true),
}));

vi.mock("@httpjpg/storyblok-api", () => ({
  getStoryblokApi: () => ({ getStory }),
}));

vi.mock("@/lib/integrations/letterboxd", () => ({ fetchLetterboxdFilms, isLetterboxdUsername }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  isLetterboxdUsername.mockReturnValue(true);
});

describe("GET /api/letterboxd", () => {
  it("returns films when configured", async () => {
    getStory.mockResolvedValueOnce({ content: { letterboxd_username: "user" } });
    fetchLetterboxdFilms.mockResolvedValueOnce({ ok: true, films: [{ title: "Dune" }] });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ films: [{ title: "Dune" }] });
  });

  it("returns 500 when no username is configured", async () => {
    getStory.mockResolvedValueOnce({ content: {} });

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      error: "Letterboxd username not configured",
    });
  });

  it("ignores a malformed username from config", async () => {
    getStory.mockResolvedValueOnce({ content: { letterboxd_username: "bad name" } });
    isLetterboxdUsername.mockReturnValue(false);

    const response = await GET();

    expect(response.status).toBe(500);
  });

  it("propagates the upstream status when the RSS fetch fails", async () => {
    getStory.mockResolvedValueOnce({ content: { letterboxd_username: "user" } });
    fetchLetterboxdFilms.mockResolvedValueOnce({ ok: false, status: 503, message: "down" });

    const response = await GET();

    expect(response.status).toBe(503);
  });

  it("reports unexpected errors and returns a 500", async () => {
    getStory.mockResolvedValueOnce({ content: { letterboxd_username: "user" } });
    fetchLetterboxdFilms.mockRejectedValueOnce(new Error("boom"));

    const response = await GET();

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
