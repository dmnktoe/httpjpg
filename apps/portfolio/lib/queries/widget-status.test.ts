// @vitest-environment node
const mockEnv = vi.hoisted(() => ({
  PSN_NPSSO: "npsso" as string | undefined,
  TWEETAPI_KEY: "key" as string | undefined,
  TWEETAPI_API_URL: "https://api.tweetapi.test",
}));

vi.mock("@httpjpg/env", () => ({ env: mockEnv }));

// unstable_cache would otherwise memoise across cases; the cache behaviour it
// provides is Next's, not ours, so the loaders are exercised directly.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));

const {
  getConfig,
  fetchLetterboxdFilms,
  fetchDiscogsCollection,
  fetchXTimeline,
  fetchRecentTrophies,
  isPlainUsername,
} = vi.hoisted(() => ({
  getConfig: vi.fn(),
  fetchLetterboxdFilms: vi.fn(),
  fetchDiscogsCollection: vi.fn(),
  fetchXTimeline: vi.fn(),
  fetchRecentTrophies: vi.fn(),
  // Stands in for each integration's real validator: rejects whitespace and
  // any path separator, which is what the traversal case below leans on.
  isPlainUsername: (value: string) => !/[\s/\\]/.test(value),
}));

vi.mock("./config", () => ({ getConfig }));

vi.mock("../integrations/letterboxd", () => ({
  fetchLetterboxdFilms,
  isLetterboxdUsername: isPlainUsername,
}));
vi.mock("../integrations/discogs", () => ({
  fetchDiscogsCollection,
  isDiscogsUsername: isPlainUsername,
}));
vi.mock("../integrations/x-posts", () => ({
  fetchXTimeline,
  isXUsername: isPlainUsername,
}));
vi.mock("../integrations/psn-trophies", () => ({
  fetchRecentTrophies,
  isPsnUsername: isPlainUsername,
}));

import { getWidgetStatus } from "./widget-status";

const ALL_ENABLED = {
  letterboxd_enabled: true,
  letterboxd_username: "user",
  discogs_enabled: true,
  discogs_username: "user",
  x_enabled: true,
  x_username: "user",
  psn_trophy_enabled: true,
  psn_username: "player",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockEnv.PSN_NPSSO = "npsso";
  mockEnv.TWEETAPI_KEY = "key";
  fetchLetterboxdFilms.mockResolvedValue({ ok: true, films: [{ title: "Stalker" }] });
  fetchDiscogsCollection.mockResolvedValue({ ok: true, releases: [{ title: "Endtroducing" }] });
  fetchXTimeline.mockResolvedValue({ ok: true, timeline: { profile: {}, posts: [] } });
  fetchRecentTrophies.mockResolvedValue({
    ok: true,
    trophies: [{ name: "Platinum" }],
    avatar: null,
  });
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getWidgetStatus", () => {
  it("returns every enabled widget's data in one envelope", async () => {
    getConfig.mockResolvedValueOnce(ALL_ENABLED);

    await expect(getWidgetStatus()).resolves.toEqual({
      letterboxd: { films: [{ title: "Stalker" }] },
      discogs: { releases: [{ title: "Endtroducing" }] },
      x: { profile: {}, posts: [] },
      trophies: { trophies: [{ name: "Platinum" }], avatar: null },
    });
  });

  it("skips the upstreams the CMS has switched off", async () => {
    getConfig.mockResolvedValueOnce({ ...ALL_ENABLED, discogs_enabled: false, x_enabled: false });

    const status = await getWidgetStatus();

    expect(status.discogs).toBeNull();
    expect(status.x).toBeNull();
    expect(fetchDiscogsCollection).not.toHaveBeenCalled();
    expect(fetchXTimeline).not.toHaveBeenCalled();
    expect(status.letterboxd).not.toBeNull();
  });

  it("returns an empty envelope when the config story cannot be read", async () => {
    getConfig.mockResolvedValueOnce(null);

    await expect(getWidgetStatus()).resolves.toEqual({
      letterboxd: null,
      discogs: null,
      x: null,
      trophies: null,
    });
  });

  it("drops a malformed username instead of passing it upstream", async () => {
    getConfig.mockResolvedValueOnce({ ...ALL_ENABLED, discogs_username: "../admin" });

    const status = await getWidgetStatus();

    expect(status.discogs).toBeNull();
    expect(fetchDiscogsCollection).not.toHaveBeenCalled();
  });

  it("still loads trophies without a username, which only narrows the lookup", async () => {
    getConfig.mockResolvedValueOnce({ ...ALL_ENABLED, psn_username: undefined });

    const status = await getWidgetStatus();

    expect(fetchRecentTrophies).toHaveBeenCalledWith("npsso", undefined);
    expect(status.trophies).not.toBeNull();
  });

  it("skips X and trophies when their server credentials are missing", async () => {
    mockEnv.TWEETAPI_KEY = undefined;
    mockEnv.PSN_NPSSO = undefined;
    getConfig.mockResolvedValueOnce(ALL_ENABLED);

    const status = await getWidgetStatus();

    expect(status.x).toBeNull();
    expect(status.trophies).toBeNull();
    expect(fetchXTimeline).not.toHaveBeenCalled();
    expect(fetchRecentTrophies).not.toHaveBeenCalled();
  });

  it("collapses an upstream failure to null", async () => {
    getConfig.mockResolvedValueOnce(ALL_ENABLED);
    fetchDiscogsCollection.mockResolvedValueOnce({ ok: false, status: 404, message: "private" });

    const status = await getWidgetStatus();

    expect(status.discogs).toBeNull();
    expect(status.letterboxd).not.toBeNull();
  });

  it("keeps one thrown upstream from taking the envelope down", async () => {
    getConfig.mockResolvedValueOnce(ALL_ENABLED);
    fetchXTimeline.mockRejectedValueOnce(new Error("boom"));

    const status = await getWidgetStatus();

    expect(status.x).toBeNull();
    expect(status.discogs).not.toBeNull();
    expect(status.letterboxd).not.toBeNull();
    expect(status.trophies).not.toBeNull();
  });
});
