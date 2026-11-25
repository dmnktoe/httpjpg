// @vitest-environment node
import { beforeEach, type MockedFunction, vi } from "vitest";

import { fetchSteamStatus, isSteamId, parsePlayer, parseRecentGames } from "./steam";

// Pixelation has its own tests; here it passes images through untouched.
vi.mock("./pixelate", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./pixelate")>()),
  pixelateImage: vi.fn(async (source: string | null | undefined) => source ?? null),
  pixelateEach: vi.fn(async (items: unknown[]) => items),
}));

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

const STEAM_ID = "76561197960435530";

const PLAYER = {
  steamid: STEAM_ID,
  personaname: "dmnktoe",
  profileurl: "https://steamcommunity.com/id/dmnktoe/",
  avatarfull: "https://avatars.steamstatic.com/a_full.jpg",
};

const GAME = {
  appid: 1245620,
  name: "ELDEN RING",
  playtime_2weeks: 845,
  playtime_forever: 9000,
  img_icon_url: "abc123",
};

function routeFetch(summaries: unknown, recent: unknown) {
  mockFetch.mockImplementation(async (url) =>
    jsonResponse(String(url).includes("GetPlayerSummaries") ? summaries : recent),
  );
}

describe("parsePlayer", () => {
  it("maps the profile", () => {
    expect(parsePlayer({ response: { players: [PLAYER] } }, STEAM_ID)).toEqual({
      name: "dmnktoe",
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
    const bare = { personaname: "dmnktoe" };

    expect(parsePlayer({ response: { players: [bare] } }, STEAM_ID)?.url).toBe(
      `https://steamcommunity.com/profiles/${STEAM_ID}/`,
    );
    expect(parsePlayer({ response: { players: [] } }, STEAM_ID)).toBeNull();
    expect(parsePlayer({}, STEAM_ID)).toBeNull();
  });
});

describe("parseRecentGames", () => {
  it("maps recent games with icon and store link", () => {
    expect(parseRecentGames({ response: { games: [GAME] } })).toEqual([
      {
        appId: 1245620,
        name: "ELDEN RING",
        minutesTwoWeeks: 845,
        minutesTotal: 9000,
        icon: "https://media.steampowered.com/steamcommunity/public/images/apps/1245620/abc123.jpg",
        url: "https://store.steampowered.com/app/1245620/",
      },
    ]);
  });

  it("treats a private profile's empty response as no games", () => {
    expect(parseRecentGames({ response: {} })).toEqual([]);
  });

  it("skips incomplete entries, defaults playtime and respects the limit", () => {
    const games = parseRecentGames(
      { response: { games: [{ appid: 1 }, { appid: 2, name: "B" }, GAME, GAME] } },
      2,
    );

    expect(games.map((game) => game.name)).toEqual(["B", "ELDEN RING"]);
    expect(games[0]).toMatchObject({ minutesTwoWeeks: 0, icon: null });
    expect(parseRecentGames({ response: { games: [GAME] } }, 0)).toEqual([]);
  });
});

describe("fetchSteamStatus", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("asks both endpoints with the key and SteamID", async () => {
    routeFetch({ response: { players: [PLAYER] } }, { response: { games: [GAME] } });

    const result = await fetchSteamStatus(STEAM_ID, "key", 2);

    const urls = mockFetch.mock.calls.map((call) => new URL(String(call[0])));
    const summary = urls.find((url) => url.pathname.includes("GetPlayerSummaries"));
    const recent = urls.find((url) => url.pathname.includes("GetRecentlyPlayedGames"));
    expect(summary?.searchParams.get("steamids")).toBe(STEAM_ID);
    expect(recent?.searchParams.get("steamid")).toBe(STEAM_ID);
    expect(recent?.searchParams.get("count")).toBe("2");
    expect(recent?.searchParams.get("key")).toBe("key");
    expect(result.ok && result.status.games[0].name).toBe("ELDEN RING");
  });

  it("fails with 404 when the SteamID has no profile", async () => {
    routeFetch({ response: { players: [] } }, { response: {} });

    expect(await fetchSteamStatus(STEAM_ID, "key")).toMatchObject({ ok: false, status: 404 });
  });

  it("surfaces an upstream error", async () => {
    mockFetch.mockResolvedValue(jsonResponse({}, false, 403));

    expect(await fetchSteamStatus(STEAM_ID, "bad")).toMatchObject({ ok: false, status: 403 });
  });

  it("surfaces a failing recent-games call", async () => {
    mockFetch.mockImplementation(async (url) =>
      String(url).includes("GetPlayerSummaries")
        ? jsonResponse({ response: { players: [PLAYER] } })
        : jsonResponse({}, false, 500),
    );

    expect(await fetchSteamStatus(STEAM_ID, "key")).toMatchObject({ ok: false, status: 500 });
  });
});

describe("isSteamId", () => {
  it("accepts SteamID64 values only", () => {
    expect(isSteamId(STEAM_ID)).toBe(true);
    expect(isSteamId("dmnktoe")).toBe(false);
    expect(isSteamId("7656119796043553")).toBe(false);
    expect(isSteamId(`${STEAM_ID}&key=x`)).toBe(false);
    expect(isSteamId(undefined)).toBe(false);
  });
});
