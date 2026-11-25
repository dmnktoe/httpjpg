// @vitest-environment node
const mockEnv = vi.hoisted(() => ({
  PSN_NPSSO: "npsso" as string | undefined,
  TWEETAPI_KEY: "key" as string | undefined,
  TWEETAPI_API_URL: "https://api.tweetapi.test",
  LASTFM_API_KEY: "lastfm-key" as string | undefined,
  STEAM_API_KEY: "steam-key" as string | undefined,
  YOUTUBE_API_KEY: "youtube-key" as string | undefined,
  GITHUB_API_TOKEN: undefined as string | undefined,
}));

vi.mock("@httpjpg/env", () => ({ env: mockEnv }));

// `"use cache"` is inert under Vitest, so the loaders run directly.
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

const {
  getConfig,
  fetchLetterboxdFilms,
  fetchDiscogsCollection,
  fetchLastfmScrobbles,
  fetchSteamStatus,
  fetchYoutubeStatus,
  fetchGithubActivity,
  fetchXTimeline,
  fetchRecentTrophies,
  fetchSchalkeStatus,
  isPlainUsername,
} = vi.hoisted(() => ({
  getConfig: vi.fn(),
  fetchLetterboxdFilms: vi.fn(),
  fetchDiscogsCollection: vi.fn(),
  fetchLastfmScrobbles: vi.fn(),
  fetchSteamStatus: vi.fn(),
  fetchYoutubeStatus: vi.fn(),
  fetchGithubActivity: vi.fn(),
  fetchXTimeline: vi.fn(),
  fetchRecentTrophies: vi.fn(),
  fetchSchalkeStatus: vi.fn(),
  // Stand-in validator: rejects whitespace and path separators.
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
vi.mock("../integrations/lastfm", () => ({
  fetchLastfmScrobbles,
  isLastfmUsername: isPlainUsername,
}));
vi.mock("../integrations/steam", () => ({ fetchSteamStatus, isSteamProfile: isPlainUsername }));
vi.mock("../integrations/youtube", () => ({
  fetchYoutubeStatus,
  isYoutubeChannelId: isPlainUsername,
}));
vi.mock("../integrations/github", () => ({
  fetchGithubActivity,
  isGithubUsername: isPlainUsername,
}));
vi.mock("../integrations/x-posts", () => ({
  fetchXTimeline,
  isXUsername: isPlainUsername,
}));
vi.mock("../integrations/schalke", () => ({ fetchSchalkeStatus }));
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
  lastfm_enabled: true,
  lastfm_username: "user",
  steam_enabled: true,
  steam_id: "76561197960435530",
  youtube_enabled: true,
  youtube_channel_id: "UC_channel",
  github_enabled: true,
  github_username: "user",
  reddit_enabled: true,
  reddit_username: "dmnktoe",
  reddit_karma: "12345",
  x_enabled: true,
  x_username: "user",
  psn_trophy_enabled: true,
  psn_username: "player",
  schalke_enabled: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockEnv.PSN_NPSSO = "npsso";
  mockEnv.TWEETAPI_KEY = "key";
  mockEnv.LASTFM_API_KEY = "lastfm-key";
  mockEnv.STEAM_API_KEY = "steam-key";
  mockEnv.YOUTUBE_API_KEY = "youtube-key";
  mockEnv.GITHUB_API_TOKEN = undefined;
  fetchSteamStatus.mockResolvedValue({ ok: true, status: { profile: {}, games: [] } });
  fetchYoutubeStatus.mockResolvedValue({ ok: true, status: { channel: {}, videos: [] } });
  fetchGithubActivity.mockResolvedValue({ ok: true, status: { profile: {}, activity: [] } });
  fetchLetterboxdFilms.mockResolvedValue({ ok: true, films: [{ title: "Stalker" }] });
  fetchDiscogsCollection.mockResolvedValue({ ok: true, releases: [{ title: "Endtroducing" }] });
  fetchLastfmScrobbles.mockResolvedValue({
    ok: true,
    tracks: [{ title: "Teardrop" }],
    total: 42,
  });
  fetchXTimeline.mockResolvedValue({ ok: true, timeline: { profile: {}, posts: [] } });
  fetchRecentTrophies.mockResolvedValue({
    ok: true,
    trophies: [{ name: "Platinum" }],
    avatar: null,
  });
  fetchSchalkeStatus.mockResolvedValue({
    ok: true,
    fixture: null,
    upcoming: null,
    standing: { position: 17 },
    url: "https://schalke04.de",
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
      lastfm: { tracks: [{ title: "Teardrop" }], total: 42 },
      steam: { profile: {}, games: [] },
      youtube: { channel: {}, videos: [] },
      github: { profile: {}, activity: [] },
      reddit: { username: "dmnktoe", karma: 12345, url: "https://www.reddit.com/user/dmnktoe/" },
      x: { profile: {}, posts: [] },
      trophies: { trophies: [{ name: "Platinum" }], avatar: null },
      schalke: {
        fixture: null,
        upcoming: null,
        standing: { position: 17 },
        url: "https://schalke04.de",
      },
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
      lastfm: null,
      steam: null,
      youtube: null,
      github: null,
      reddit: null,
      x: null,
      trophies: null,
      schalke: null,
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

  it("reads Last.fm with the configured username and server key", async () => {
    getConfig.mockResolvedValueOnce(ALL_ENABLED);

    await getWidgetStatus();

    expect(fetchLastfmScrobbles).toHaveBeenCalledWith("user", "lastfm-key");
  });

  it("skips Last.fm without its server key", async () => {
    mockEnv.LASTFM_API_KEY = undefined;
    getConfig.mockResolvedValueOnce(ALL_ENABLED);

    const status = await getWidgetStatus();

    expect(status.lastfm).toBeNull();
    expect(fetchLastfmScrobbles).not.toHaveBeenCalled();
  });

  it("passes each new widget its setting and server key", async () => {
    getConfig.mockResolvedValueOnce(ALL_ENABLED);

    await getWidgetStatus();

    expect(fetchSteamStatus).toHaveBeenCalledWith("76561197960435530", "steam-key");
    expect(fetchYoutubeStatus).toHaveBeenCalledWith("UC_channel", "youtube-key");
    expect(fetchGithubActivity).toHaveBeenCalledWith("user", undefined);
  });

  it("skips Steam and YouTube without their keys but loads GitHub without a token", async () => {
    mockEnv.STEAM_API_KEY = undefined;
    mockEnv.YOUTUBE_API_KEY = undefined;
    getConfig.mockResolvedValueOnce(ALL_ENABLED);

    const status = await getWidgetStatus();

    expect(status.steam).toBeNull();
    expect(status.youtube).toBeNull();
    expect(status.github).not.toBeNull();
    expect(fetchSteamStatus).not.toHaveBeenCalled();
    expect(fetchYoutubeStatus).not.toHaveBeenCalled();
  });

  it("leaves Reddit out when it is off or has no usable karma", async () => {
    getConfig.mockResolvedValueOnce({ ...ALL_ENABLED, reddit_enabled: false });
    expect((await getWidgetStatus()).reddit).toBeNull();

    getConfig.mockResolvedValueOnce({ ...ALL_ENABLED, reddit_karma: undefined });
    expect((await getWidgetStatus()).reddit).toBeNull();
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
