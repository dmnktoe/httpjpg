// @vitest-environment node
import sharp from "sharp";
import { beforeEach, type MockedFunction, vi } from "vitest";

const { safeFetch, readLimited } = vi.hoisted(() => ({
  safeFetch: vi.fn(),
  readLimited: vi.fn(),
}));

vi.mock("./favicon", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./favicon")>()),
  safeFetch,
  readLimited,
}));

import {
  fetchSchalkeStatus,
  type OpenLigaMatch,
  type OpenLigaTableRow,
  parseFixture,
  pixelateCrest,
  readStanding,
  recentMatches,
} from "./schalke";

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

const S04 = { teamId: 9, teamName: "FC Schalke 04", shortName: "S04" };
const HOFFENHEIM = { teamId: 175, teamName: "TSG Hoffenheim", shortName: "Hoffenheim" };
const KOELN = { teamId: 65, teamName: "1. FC Köln", shortName: "Köln" };
const UNION = { teamId: 80, teamName: "1. FC Union Berlin", shortName: "Union Berlin" };

function match(overrides: Partial<OpenLigaMatch>): OpenLigaMatch {
  return {
    leagueShortcut: "bl1",
    leagueSeason: 2026,
    matchDateTimeUTC: "2026-11-08T18:30:00Z",
    matchIsFinished: true,
    group: { groupOrderID: 9 },
    team1: HOFFENHEIM,
    team2: S04,
    matchResults: [
      { pointsTeam1: 2, pointsTeam2: 0, resultOrderID: 1 },
      { pointsTeam1: 2, pointsTeam2: 1, resultOrderID: 2 },
    ],
    ...overrides,
  };
}

const LAST = match({});

function row(teamInfoId: number, points: number, goals: number, opponentGoals: number) {
  return { teamInfoId, points, goals, opponentGoals, matches: 9 } satisfies OpenLigaTableRow;
}

const TABLE = [row(65, 9, 10, 14), row(80, 7, 7, 21), row(9, 6, 5, 11)];

beforeEach(() => {
  vi.resetAllMocks();
});

describe("recentMatches", () => {
  it("drops the women's side, which shares the team id", () => {
    const women = match({ leagueShortcut: "rlw-frauen", matchDateTimeUTC: "2026-11-09T12:00:00Z" });

    expect(recentMatches([women, LAST])).toEqual([LAST]);
  });

  it("drops matches that are not finished or have no result yet", () => {
    const upcoming = match({ matchIsFinished: false, matchResults: [] });
    const unscored = match({ matchResults: [] });

    expect(recentMatches([upcoming, unscored, LAST])).toEqual([LAST]);
  });

  it("puts the newest match first and keeps the cup", () => {
    const cup = match({ leagueShortcut: "dfb", matchDateTimeUTC: "2026-11-10T19:00:00Z" });

    expect(recentMatches([LAST, cup])).toEqual([cup, LAST]);
  });
});

describe("parseFixture", () => {
  it("reads the final score, not the half-time one", () => {
    expect(parseFixture(LAST)).toEqual({
      home: "Hoffenheim",
      away: "S04",
      homeGoals: 2,
      awayGoals: 1,
      homeCrest: null,
      awayCrest: null,
      outcome: "loss",
      competition: "bl1",
      playedAt: "2026-11-08T18:30:00Z",
    });
  });

  it("judges the outcome from Schalke's end of the pitch", () => {
    const away = match({ matchResults: [{ pointsTeam1: 0, pointsTeam2: 2, resultOrderID: 2 }] });
    const home = match({
      team1: S04,
      team2: HOFFENHEIM,
      matchResults: [{ pointsTeam1: 3, pointsTeam2: 1, resultOrderID: 2 }],
    });
    const level = match({ matchResults: [{ pointsTeam1: 1, pointsTeam2: 1, resultOrderID: 2 }] });

    expect(parseFixture(away)?.outcome).toBe("win");
    expect(parseFixture(home)?.outcome).toBe("win");
    expect(parseFixture(level)?.outcome).toBe("draw");
  });

  it("falls back to the full name when there is no short one", () => {
    const fixture = parseFixture(match({ team1: { teamId: 175, teamName: "TSG Hoffenheim" } }));

    expect(fixture?.home).toBe("TSG Hoffenheim");
  });

  it("returns null without a result", () => {
    expect(parseFixture(match({ matchResults: [] }))).toBeNull();
  });
});

describe("pixelateCrest", () => {
  const CREST_URL = "https://crests.test/s04.png";

  async function crest(): Promise<Buffer> {
    return sharp({
      create: {
        width: 200,
        height: 120,
        channels: 4,
        background: { r: 0, g: 75, b: 160, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
  }

  it("shrinks the crest to a 16px data URI", async () => {
    safeFetch.mockResolvedValueOnce({ ok: true });
    readLimited.mockResolvedValueOnce(await crest());

    const uri = await pixelateCrest(CREST_URL);

    expect(uri).toMatch(/^data:image\/png;base64,/);
    const pixels = Buffer.from(uri!.split(",")[1], "base64");
    await expect(sharp(pixels).metadata()).resolves.toMatchObject({ width: 16, height: 16 });
    expect(safeFetch.mock.calls[0][0].href).toBe(CREST_URL);
  });

  it("skips a missing or non-http icon without fetching", async () => {
    await expect(pixelateCrest(undefined)).resolves.toBeNull();
    await expect(pixelateCrest("file:///etc/passwd")).resolves.toBeNull();
    expect(safeFetch).not.toHaveBeenCalled();
  });

  it("returns null when the icon host is refused or fails", async () => {
    safeFetch.mockResolvedValueOnce(null);
    await expect(pixelateCrest(CREST_URL)).resolves.toBeNull();

    safeFetch.mockResolvedValueOnce({ ok: false });
    await expect(pixelateCrest(CREST_URL)).resolves.toBeNull();
  });

  it("returns null when the icon is too large or not an image", async () => {
    safeFetch.mockResolvedValueOnce({ ok: true });
    readLimited.mockResolvedValueOnce(null);
    await expect(pixelateCrest(CREST_URL)).resolves.toBeNull();

    safeFetch.mockResolvedValueOnce({ ok: true });
    readLimited.mockResolvedValueOnce(Buffer.from("not an image"));
    await expect(pixelateCrest(CREST_URL)).resolves.toBeNull();
  });
});

describe("readStanding", () => {
  it("reports a drop when the matchday cost a place", () => {
    const matchday = [
      LAST,
      match({
        team1: UNION,
        team2: KOELN,
        matchResults: [{ pointsTeam1: 1, pointsTeam2: 0, resultOrderID: 2 }],
      }),
    ];

    expect(readStanding(TABLE, matchday, "bl1")).toEqual({
      position: 3,
      previousPosition: 2,
      trend: "down",
      points: 6,
      teams: 3,
      league: "bl1",
    });
  });

  it("reports a climb when the matchday won a place", () => {
    const table = [row(9, 9, 8, 11), row(80, 7, 7, 21)];
    const matchday = [
      match({
        team1: S04,
        team2: UNION,
        matchResults: [{ pointsTeam1: 3, pointsTeam2: 0, resultOrderID: 2 }],
      }),
    ];

    expect(readStanding(table, matchday, "bl2")).toMatchObject({
      position: 1,
      previousPosition: 2,
      trend: "up",
    });
  });

  it("holds the position steady when nothing moved", () => {
    const matchday = [
      match({ matchResults: [{ pointsTeam1: 1, pointsTeam2: 1, resultOrderID: 2 }] }),
    ];

    expect(readStanding(TABLE, matchday, "bl1")).toMatchObject({
      position: 3,
      previousPosition: 3,
      trend: "same",
    });
  });

  it("ignores matchday games that are still running", () => {
    const running = match({ matchIsFinished: false });

    expect(readStanding(TABLE, [running], "bl1")).toMatchObject({ trend: "same" });
  });

  it("has no previous position on the first matchday", () => {
    const table = [
      { ...row(65, 3, 2, 0), matches: 1 },
      { ...row(9, 0, 0, 2), matches: 1 },
    ];
    const opener = match({
      team1: KOELN,
      team2: S04,
      matchResults: [{ pointsTeam1: 2, pointsTeam2: 0, resultOrderID: 2 }],
    });

    expect(readStanding(table, [opener], "bl1")).toMatchObject({
      position: 2,
      previousPosition: null,
      trend: "same",
    });
  });

  it("returns null when the club is not in the table", () => {
    expect(readStanding([row(65, 9, 10, 14)], [], "bl1")).toBeNull();
  });
});

describe("fetchSchalkeStatus", () => {
  it("joins the last fixture with the league table", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse([LAST]))
      .mockResolvedValueOnce(jsonResponse(TABLE))
      .mockResolvedValueOnce(jsonResponse([LAST]));

    const result = await fetchSchalkeStatus();

    expect(result).toMatchObject({
      ok: true,
      fixture: { home: "Hoffenheim", away: "S04", outcome: "loss" },
      standing: { position: 3, league: "bl1" },
      url: "https://schalke04.de",
    });
    const urls = mockFetch.mock.calls.map(([url]) => url);
    expect(urls[0]).toBe("https://api.openligadb.de/getmatchesbyteamid/9/8/0");
    expect(urls).toContain("https://api.openligadb.de/getbltable/bl1/2026");
    expect(urls).toContain("https://api.openligadb.de/getmatchdata/bl1/2026/9");
  });

  it("attaches both pixelated crests to the fixture", async () => {
    const withIcons = match({
      team1: { ...HOFFENHEIM, teamIconUrl: "https://crests.test/tsg.png" },
      team2: { ...S04, teamIconUrl: "https://crests.test/s04.png" },
    });
    const pixels = await sharp({
      create: { width: 32, height: 32, channels: 4, background: { r: 0, g: 75, b: 160, alpha: 1 } },
    })
      .png()
      .toBuffer();
    safeFetch.mockResolvedValue({ ok: true });
    readLimited.mockResolvedValue(pixels);
    mockFetch
      .mockResolvedValueOnce(jsonResponse([withIcons]))
      .mockResolvedValueOnce(jsonResponse(TABLE))
      .mockResolvedValueOnce(jsonResponse([withIcons]));

    const result = await fetchSchalkeStatus();

    expect(result).toMatchObject({
      fixture: {
        homeCrest: expect.stringMatching(/^data:image\/png;base64,/),
        awayCrest: expect.stringMatching(/^data:image\/png;base64,/),
      },
    });
    expect(safeFetch).toHaveBeenCalledTimes(2);
  });

  it("shows a cup tie as the fixture but ranks from the last league match", async () => {
    const cup = match({ leagueShortcut: "dfb", matchDateTimeUTC: "2026-11-10T19:00:00Z" });
    mockFetch
      .mockResolvedValueOnce(jsonResponse([LAST, cup]))
      .mockResolvedValueOnce(jsonResponse(TABLE))
      .mockResolvedValueOnce(jsonResponse([LAST]));

    const result = await fetchSchalkeStatus();

    expect(result).toMatchObject({ fixture: { competition: "dfb" }, standing: { league: "bl1" } });
  });

  it("keeps the fixture when the table cannot be read", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse([LAST]))
      .mockResolvedValueOnce(jsonResponse(null, false, 500))
      .mockResolvedValueOnce(jsonResponse([LAST]));

    const result = await fetchSchalkeStatus();

    expect(result).toMatchObject({ ok: true, fixture: { home: "Hoffenheim" }, standing: null });
  });

  it("keeps the position when only the matchday is missing", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse([LAST]))
      .mockResolvedValueOnce(jsonResponse(TABLE))
      .mockResolvedValueOnce(jsonResponse(null, false, 500));

    const result = await fetchSchalkeStatus();

    expect(result).toMatchObject({ standing: { position: 3, trend: "same" } });
  });

  it("answers empty in the off-season instead of failing", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]));

    await expect(fetchSchalkeStatus()).resolves.toMatchObject({
      ok: true,
      fixture: null,
      standing: null,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("propagates an upstream failure", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(null, false, 503));

    await expect(fetchSchalkeStatus()).resolves.toMatchObject({ ok: false, status: 503 });
  });

  it("rejects a body that is not a match list", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ message: "nope" }));

    await expect(fetchSchalkeStatus()).resolves.toMatchObject({ ok: false, status: 502 });
  });
});
