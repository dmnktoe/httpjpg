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
  getProfileFromAccountId: vi.fn(async () => ({
    avatars: [{ size: "l", url: "https://avatar.test/l.png" }],
  })),
  getUserTitles: vi.fn(),
  getUserTrophiesEarnedForTitle: vi.fn(),
  getTitleTrophies: vi.fn(),
}));

vi.mock("psn-api", () => psn);

import { buildTrophy, fetchRecentTrophies, isPsnUsername } from "./psn-trophies";

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
  trophyTitleName: "It Takes Two",
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
      {
        trophyName: "Stolz der Nation",
        trophyDetail: "Get 250 sniper rifle kills",
        trophyIconUrl: "https://img/trophy.png",
      },
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
      image: "https://img/trophy.png",
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
      { trophyName: "x", trophyDetail: null, trophyIconUrl: null },
    );
    expect(trophy?.platform).toBe("PS4");
  });

  it("falls back to a generic link without a valid username", () => {
    const trophy = buildTrophy(TITLE, { trophyType: "bronze", earnedDateTime: null }, undefined);
    expect(trophy?.url).toBe("https://www.playstation.com");
  });
});

describe("fetchRecentTrophies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns recent earned trophies plus the PSN avatar", async () => {
    psn.getUserTitles.mockResolvedValueOnce({ trophyTitles: [TITLE] });
    psn.getUserTrophiesEarnedForTitle.mockResolvedValueOnce({
      trophies: [
        { trophyId: 1, earned: true, earnedDateTime: "2026-04-20T00:00:00Z", trophyType: "bronze" },
        { trophyId: 2, earned: true, earnedDateTime: "2026-04-27T09:23:08Z", trophyType: "silver" },
        { trophyId: 3, earned: false, trophyType: "gold" },
      ],
    });
    psn.getTitleTrophies.mockResolvedValueOnce({
      trophies: [
        { trophyId: 1, trophyName: "First Step", trophyDetail: "a", trophyIconUrl: "i1" },
        { trophyId: 2, trophyName: "Stolz der Nation", trophyDetail: "b", trophyIconUrl: "i2" },
      ],
    });

    const result = await fetchRecentTrophies("npsso", "bullensohn6");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.avatar).toBe("https://avatar.test/l.png");
      expect(result.trophies.map((trophy) => trophy.name)).toEqual([
        "Stolz der Nation",
        "First Step",
      ]);
      expect(result.trophies[0].image).toBe("i2");
    }
  });

  it("orders trophies by earned date across titles", async () => {
    psn.getUserTitles.mockResolvedValueOnce({ trophyTitles: [TITLE, OLDER_TITLE] });
    psn.getUserTrophiesEarnedForTitle
      .mockResolvedValueOnce({
        trophies: [
          {
            trophyId: 2,
            earned: true,
            earnedDateTime: "2026-04-27T09:23:08Z",
            trophyType: "silver",
          },
        ],
      })
      .mockResolvedValueOnce({
        trophies: [
          { trophyId: 9, earned: true, earnedDateTime: "2026-05-10T00:00:00Z", trophyType: "gold" },
        ],
      });
    psn.getTitleTrophies
      .mockResolvedValueOnce({
        trophies: [{ trophyId: 2, trophyName: "BF Trophy", trophyIconUrl: "i2" }],
      })
      .mockResolvedValueOnce({
        trophies: [{ trophyId: 9, trophyName: "Old Trophy", trophyIconUrl: "i9" }],
      });

    const result = await fetchRecentTrophies("npsso");

    expect(result.ok && result.trophies.map((trophy) => trophy.name)).toEqual([
      "Old Trophy",
      "BF Trophy",
    ]);
  });

  it("skips titles with no earned trophies", async () => {
    psn.getUserTitles.mockResolvedValueOnce({ trophyTitles: [RECENT_UNEARNED, TITLE] });
    psn.getUserTrophiesEarnedForTitle.mockResolvedValueOnce({
      trophies: [
        { trophyId: 2, earned: true, earnedDateTime: "2026-04-27T09:23:08Z", trophyType: "silver" },
      ],
    });
    psn.getTitleTrophies.mockResolvedValueOnce({
      trophies: [{ trophyId: 2, trophyName: "Stolz der Nation", trophyIconUrl: "i2" }],
    });

    const result = await fetchRecentTrophies("npsso");

    expect(psn.getUserTrophiesEarnedForTitle).toHaveBeenCalledTimes(1);
    expect(psn.getUserTrophiesEarnedForTitle).toHaveBeenCalledWith(
      { accessToken: expect.any(String) },
      "me",
      "NPWR-BF6",
      "all",
      { npServiceName: "trophy2" },
    );
    expect(result.ok && result.trophies).toHaveLength(1);
  });

  it("returns an empty list with the avatar when nothing is earned", async () => {
    psn.getUserTitles.mockResolvedValueOnce({ trophyTitles: [RECENT_UNEARNED] });
    const result = await fetchRecentTrophies("npsso");
    expect(result).toEqual({ ok: true, trophies: [], avatar: "https://avatar.test/l.png" });
  });

  it("surfaces an API failure", async () => {
    psn.getUserTitles.mockRejectedValueOnce(new Error("Invalid npsso token"));
    const result = await fetchRecentTrophies("npsso");
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
