// @vitest-environment node
import { beforeEach, type MockedFunction, vi } from "vitest";

vi.mock("./pixelate", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./pixelate")>()),
  pixelateImage: vi.fn(async (source: string | null | undefined) => source ?? null),
  pixelateEach: vi.fn(async (items: unknown[]) => items),
}));

import { fetchSteamStatus, isSteamId, isSteamProfile, parseOwnedGames, parsePlayer } from "./steam";

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

const STEAM_ID = "76561197960435530";

const PLAYER = {
  steamid: STEAM_ID,
  personaname: "yl33lyxx",
  profileurl: "https://steamcommunity.com/id/dmnktoe/",
  avatarfull: "https://avatars.steamstatic.com/a_full.jpg",
};

const ELDEN = {
  appid: 1245620,
  name: "ELDEN RING",
  playtime_2weeks: 845,
  playtime_forever: 9000,
  img_icon_url: "abc123",
  rtime_last_played: 1764000000,
};

const PORTAL = {
  appid: 400,
  name: "Portal",
  playtime_forever: 300,
  img_icon_url: "def456",
  rtime_last_played: 1600000000,
};

function routeFetch(bodies: { vanity?: unknown; summaries?: unknown; owned?: unknown }) {
  mockFetch.mockImplementation(async (url) => {
    const target = String(url);
    if (target.includes("ResolveVanityURL")) return jsonResponse(bodies.vanity ?? {});
    if (target.includes("GetPlayerSummaries")) return jsonResponse(bodies.summaries ?? {});
    return jsonResponse(bodies.owned ?? {});
  });
}

describe("parsePlayer", () => {
  it("maps the profile", () => {
    expect(parsePlayer({ response: { players: [PLAYER] } }, STEAM_ID)).toEqual({
      name: "yl33lyxx",
      avatar: PLAYER.avatarfull,
      url: PLAYER.profileurl,
      inGame: null,
    });
  });

  it("reads the game running right now", () => {
    const playing = { ...PLAYER, gameid: "1245620", gameextrainfo: "ELDEN RING" };

    expect(parsePlayer({ response: { players: [playing] } }, STEAM_ID)?.inGame).toEqual({
      appId: 1245620,
      name: "ELDEN RING",
    });
  });

  it("falls back to the numeric profile url and returns null without a player", () => {
    expect(parsePlayer({ response: { players: [{ personaname: "x" }] } }, STEAM_ID)?.url).toBe(
      `https://steamcommunity.com/profiles/${STEAM_ID}/`,
    );
    expect(parsePlayer({ response: { players: [] } }, STEAM_ID)).toBeNull();
    expect(parsePlayer({}, STEAM_ID)).toBeNull();
  });
});

describe("parseOwnedGames", () => {
  it("lists the most recently played games first, however long ago", () => {
    const games = parseOwnedGames({ response: { games: [PORTAL, ELDEN] } });

    expect(games.map((game) => game.name)).toEqual(["ELDEN RING", "Portal"]);
    expect(games[0]).toEqual({
      appId: 1245620,
      name: "ELDEN RING",
      minutesTwoWeeks: 845,
      minutesTotal: 9000,
      lastPlayedAt: new Date(1764000000 * 1000).toISOString(),
      icon: "https://media.steampowered.com/steamcommunity/public/images/apps/1245620/abc123.jpg",
      url: "https://store.steampowered.com/app/1245620/",
    });
    expect(games[1]).toMatchObject({
      minutesTwoWeeks: 0,
      lastPlayedAt: "2020-09-13T12:26:40.000Z",
    });
  });

  it("skips games never played or missing a name, and respects the limit", () => {
    const never = { ...PORTAL, appid: 10, rtime_last_played: 0 };
    const nameless = { ...ELDEN, name: undefined };

    expect(parseOwnedGames({ response: { games: [never, nameless, PORTAL] } })).toHaveLength(1);
    expect(parseOwnedGames({ response: { games: [ELDEN, PORTAL] } }, 1)).toHaveLength(1);
    expect(parseOwnedGames({ response: { games: [ELDEN] } }, 0)).toEqual([]);
  });

  it("treats private game details as no games", () => {
    expect(parseOwnedGames({ response: {} })).toEqual([]);
    expect(parseOwnedGames({})).toEqual([]);
  });
});

describe("fetchSteamStatus", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("reads the profile and the owned games for a SteamID64", async () => {
    routeFetch({
      summaries: { response: { players: [PLAYER] } },
      owned: { response: { games: [PORTAL, ELDEN] } },
    });

    const result = await fetchSteamStatus(STEAM_ID, "key", 2);

    const urls = mockFetch.mock.calls.map((call) => new URL(String(call[0])));
    expect(urls.some((url) => url.pathname.includes("ResolveVanityURL"))).toBe(false);
    const owned = urls.find((url) => url.pathname.includes("GetOwnedGames"));
    expect(owned?.searchParams.get("steamid")).toBe(STEAM_ID);
    expect(owned?.searchParams.get("include_appinfo")).toBe("1");
    expect(owned?.searchParams.get("include_played_free_games")).toBe("1");
    expect(result.ok && result.status.games.map((game) => game.name)).toEqual([
      "ELDEN RING",
      "Portal",
    ]);
  });

  it("resolves a custom profile name first", async () => {
    routeFetch({
      vanity: { response: { success: 1, steamid: STEAM_ID } },
      summaries: { response: { players: [PLAYER] } },
      owned: { response: { games: [ELDEN] } },
    });

    const result = await fetchSteamStatus("dmnktoe", "key");

    const vanity = new URL(String(mockFetch.mock.calls[0][0]));
    expect(vanity.pathname).toContain("ResolveVanityURL");
    expect(vanity.searchParams.get("vanityurl")).toBe("dmnktoe");
    expect(result.ok).toBe(true);
  });

  it("fails with 404 for an unknown profile name", async () => {
    routeFetch({ vanity: { response: { success: 42, message: "No match" } } });

    expect(await fetchSteamStatus("nobody", "key")).toMatchObject({ ok: false, status: 404 });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("fails with 404 when the SteamID has no profile", async () => {
    routeFetch({ summaries: { response: { players: [] } }, owned: { response: {} } });

    expect(await fetchSteamStatus(STEAM_ID, "key")).toMatchObject({ ok: false, status: 404 });
  });

  it("surfaces upstream errors from either call", async () => {
    mockFetch.mockResolvedValue(jsonResponse({}, false, 403));
    expect(await fetchSteamStatus(STEAM_ID, "bad")).toMatchObject({ ok: false, status: 403 });

    mockFetch.mockImplementation(async (url) =>
      String(url).includes("GetPlayerSummaries")
        ? jsonResponse({ response: { players: [PLAYER] } })
        : jsonResponse({}, false, 500),
    );
    expect(await fetchSteamStatus(STEAM_ID, "key")).toMatchObject({ ok: false, status: 500 });
  });
});

describe("steam profile validation", () => {
  it("accepts SteamID64 values and custom profile names", () => {
    expect(isSteamId(STEAM_ID)).toBe(true);
    expect(isSteamId("dmnktoe")).toBe(false);
    expect(isSteamProfile(STEAM_ID)).toBe(true);
    expect(isSteamProfile("dmnktoe")).toBe(true);
    expect(isSteamProfile("dmn-ktoe_2")).toBe(true);
  });

  it("rejects values that could reshape the request", () => {
    expect(isSteamProfile("../admin")).toBe(false);
    expect(isSteamProfile("dmnktoe&key=x")).toBe(false);
    expect(isSteamProfile("a")).toBe(false);
    expect(isSteamProfile(undefined)).toBe(false);
  });
});
