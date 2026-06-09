import { beforeEach, vi } from "vitest";

const psn = vi.hoisted(() => ({
  exchangeNpssoForCode: vi.fn(async () => "code"),
  exchangeCodeForAccessToken: vi.fn(async () => ({
    accessToken: "access",
    expiresIn: 3600,
    refreshToken: "refresh",
    refreshTokenExpiresIn: 100_000,
  })),
  exchangeRefreshTokenForAuthTokens: vi.fn(async () => ({
    accessToken: "access2",
    expiresIn: 3600,
    refreshToken: "refresh2",
    refreshTokenExpiresIn: 100_000,
  })),
  getUserTitles: vi.fn(),
  getUserTrophiesEarnedForTitle: vi.fn(),
  getTitleTrophies: vi.fn(),
}));

vi.mock("psn-api", () => psn);

import { buildTrophy, fetchLatestTrophy, isPsnUsername } from "./psn-trophies";

const TITLE = {
  npServiceName: "trophy2" as const,
  npCommunicationId: "NPWR-BF6",
  trophyTitleName: "Battlefield 6",
  trophyTitlePlatform: "PS5",
  trophyTitleIconUrl: "https://image.api.playstation.com/bf6.png",
  lastUpdatedDateTime: "2026-04-27T09:23:08Z",
  earnedTrophies: { bronze: 5, silver: 2, gold: 1, platinum: 0 },
};

const OLDER_TITLE = {
  ...TITLE,
  npCommunicationId: "NPWR-OLD",
  lastUpdatedDateTime: "2026-01-01T00:00:00Z",
};

const RECENT_UNEARNED = {
  ...TITLE,
  npCommunicationId: "NPWR-FC26",
  trophyTitleName: "EA SPORTS FC 26",
  lastUpdatedDateTime: "2026-05-01T00:00:00Z",
  earnedTrophies: { bronze: 0, silver: 0, gold: 0, platinum: 0 as const },
};

describe("buildTrophy", () => {
  it("merges title, earned record, and definition into the widget shape", () => {
    const trophy = buildTrophy(
      TITLE,
      { trophyType: "silver", earnedDateTime: "2026-04-27T09:23:08Z" },
      { trophyName: "Stolz der Nation", trophyDetail: "Get 250 sniper rifle kills" },
      "bullensohn6",
    );
    expect(trophy).toEqual({
      name: "Stolz der Nation",
      game: "Battlefield 6",
      platform: "PS5",
      type: "silver",
      description: "Get 250 sniper rifle kills",
      earnedAt: "2026-04-27T09:23:08Z",
      url: "https://psnprofiles.com/bullensohn6",
      avatar: "https://image.api.playstation.com/bf6.png",
    });
  });

  it("returns null for an unrecognisable trophy tier", () => {
    expect(
      buildTrophy(TITLE, { trophyType: "diamond", earnedDateTime: null }, undefined),
    ).toBeNull();
  });

  it("keeps only the first platform segment", () => {
    const trophy = buildTrophy(
      { ...TITLE, trophyTitlePlatform: "PS4,PSVITA" },
      { trophyType: "gold", earnedDateTime: null },
      { trophyName: "x", trophyDetail: null },
    );
    expect(trophy?.platform).toBe("PS4");
  });

  it("falls back to a generic link without a valid username", () => {
    const trophy = buildTrophy(TITLE, { trophyType: "bronze", earnedDateTime: null }, undefined);
    expect(trophy?.url).toBe("https://www.playstation.com");
  });
});

describe("fetchLatestTrophy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the most recently earned trophy from the most recent title", async () => {
    psn.getUserTitles.mockResolvedValueOnce({ trophyTitles: [OLDER_TITLE, TITLE] });
    psn.getUserTrophiesEarnedForTitle.mockResolvedValueOnce({
      trophies: [
        { trophyId: 1, earned: true, earnedDateTime: "2026-04-20T00:00:00Z", trophyType: "bronze" },
        { trophyId: 2, earned: true, earnedDateTime: "2026-04-27T09:23:08Z", trophyType: "silver" },
        { trophyId: 3, earned: false, trophyType: "gold" },
      ],
    });
    psn.getTitleTrophies.mockResolvedValueOnce({
      trophies: [
        { trophyId: 1, trophyName: "First Step", trophyDetail: "a" },
        { trophyId: 2, trophyName: "Stolz der Nation", trophyDetail: "b" },
      ],
    });

    const result = await fetchLatestTrophy("npsso", "bullensohn6");

    expect(psn.getTitleTrophies).toHaveBeenCalledWith(
      { accessToken: "access" },
      "NPWR-BF6",
      "all",
      { npServiceName: "trophy2" },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.trophies).toHaveLength(1);
      expect(result.trophies[0]).toMatchObject({
        name: "Stolz der Nation",
        type: "silver",
        earnedAt: "2026-04-27T09:23:08Z",
        game: "Battlefield 6",
      });
    }
  });

  it("skips the most recent title when it has no earned trophies", async () => {
    psn.getUserTitles.mockResolvedValueOnce({ trophyTitles: [RECENT_UNEARNED, TITLE] });
    psn.getUserTrophiesEarnedForTitle.mockResolvedValueOnce({
      trophies: [
        { trophyId: 2, earned: true, earnedDateTime: "2026-04-27T09:23:08Z", trophyType: "silver" },
      ],
    });
    psn.getTitleTrophies.mockResolvedValueOnce({
      trophies: [{ trophyId: 2, trophyName: "Stolz der Nation", trophyDetail: "b" }],
    });

    const result = await fetchLatestTrophy("npsso");

    expect(psn.getUserTrophiesEarnedForTitle).toHaveBeenCalledWith(
      { accessToken: expect.any(String) },
      "me",
      "NPWR-BF6",
      "all",
      { npServiceName: "trophy2" },
    );
    expect(result.ok && result.trophies[0]?.game).toBe("Battlefield 6");
  });

  it("returns an empty list when the account has no titles", async () => {
    psn.getUserTitles.mockResolvedValueOnce({ trophyTitles: [] });
    const result = await fetchLatestTrophy("npsso");
    expect(result).toEqual({ ok: true, trophies: [] });
  });

  it("returns an empty list when no trophy has been earned", async () => {
    psn.getUserTitles.mockResolvedValueOnce({ trophyTitles: [TITLE] });
    psn.getUserTrophiesEarnedForTitle.mockResolvedValueOnce({
      trophies: [{ trophyId: 1, earned: false, trophyType: "bronze" }],
    });
    psn.getTitleTrophies.mockResolvedValueOnce({ trophies: [] });
    const result = await fetchLatestTrophy("npsso");
    expect(result).toEqual({ ok: true, trophies: [] });
  });

  it("surfaces an API failure", async () => {
    psn.getUserTitles.mockRejectedValueOnce(new Error("Invalid npsso token"));
    const result = await fetchLatestTrophy("npsso");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(502);
      expect(result.message).toContain("npsso");
    }
  });
});

describe("isPsnUsername", () => {
  it("accepts valid PSN online IDs", () => {
    expect(isPsnUsername("bullensohn6")).toBe(true);
    expect(isPsnUsername("dmnk-toe")).toBe(true);
    expect(isPsnUsername("a_b_c")).toBe(true);
  });

  it("rejects values with slashes, dots, or other unsafe characters", () => {
    expect(isPsnUsername("../etc")).toBe(false);
    expect(isPsnUsername("user/view")).toBe(false);
    expect(isPsnUsername("dom.user")).toBe(false);
    expect(isPsnUsername("1leadingdigit")).toBe(false);
    expect(isPsnUsername("ab")).toBe(false);
    expect(isPsnUsername("")).toBe(false);
    expect(isPsnUsername(undefined)).toBe(false);
  });
});
