// @vitest-environment node
vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getStory, fetchDiscogsCollection, isDiscogsUsername } = vi.hoisted(() => ({
  getStory: vi.fn(),
  fetchDiscogsCollection: vi.fn(),
  isDiscogsUsername: vi.fn(() => true),
}));

vi.mock("@httpjpg/storyblok-api", () => ({
  getStoryblokApi: () => ({ getStory }),
}));

vi.mock("@/lib/integrations/discogs", () => ({ fetchDiscogsCollection, isDiscogsUsername }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  isDiscogsUsername.mockReturnValue(true);
});

describe("GET /api/discogs", () => {
  it("returns the releases when configured", async () => {
    getStory.mockResolvedValueOnce({ content: { discogs_username: "user" } });
    fetchDiscogsCollection.mockResolvedValueOnce({
      ok: true,
      releases: [{ title: "Endtroducing....." }],
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      releases: [{ title: "Endtroducing....." }],
    });
  });

  it("caches the response at the edge", async () => {
    getStory.mockResolvedValueOnce({ content: { discogs_username: "user" } });
    fetchDiscogsCollection.mockResolvedValueOnce({ ok: true, releases: [] });

    const response = await GET();

    expect(response.headers.get("Cache-Control")).toContain("s-maxage=900");
  });

  it("returns 500 when no username is configured", async () => {
    getStory.mockResolvedValueOnce({ content: {} });

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      error: "Discogs username not configured",
    });
  });

  it("ignores a malformed username from config", async () => {
    getStory.mockResolvedValueOnce({ content: { discogs_username: "../admin" } });
    isDiscogsUsername.mockReturnValue(false);

    const response = await GET();

    expect(response.status).toBe(500);
    expect(fetchDiscogsCollection).not.toHaveBeenCalled();
  });

  it("returns 500 when the config story cannot be read", async () => {
    getStory.mockRejectedValueOnce(new Error("storyblok down"));

    const response = await GET();

    expect(response.status).toBe(500);
  });

  it("propagates the upstream status when the collection fetch fails", async () => {
    getStory.mockResolvedValueOnce({ content: { discogs_username: "user" } });
    fetchDiscogsCollection.mockResolvedValueOnce({ ok: false, status: 404, message: "private" });

    const response = await GET();

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ message: "private" });
  });

  it("reports unexpected errors and returns a 500", async () => {
    getStory.mockResolvedValueOnce({ content: { discogs_username: "user" } });
    fetchDiscogsCollection.mockRejectedValueOnce(new Error("boom"));

    const response = await GET();

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
