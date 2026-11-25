import type { SteamGame, SteamStatus } from "./steam";
import { featuredSteamGame, formatPlaytime, steamLine } from "./steam-game";

const game: SteamGame = {
  appId: 1245620,
  name: "ELDEN RING",
  minutesTwoWeeks: 845,
  minutesTotal: 9000,
  lastPlayedAt: "2026-11-20T10:00:00.000Z",
  icon: "data:image/png;base64,AAAA",
  url: "https://store.steampowered.com/app/1245620/",
};
const other: SteamGame = { ...game, appId: 10, name: "Counter-Strike" };
const base: SteamStatus = {
  profile: { name: "d", avatar: null, url: "u", isOnline: false, inGame: null },
  games: [other, game],
};

function playing(appId: number, name: string): SteamStatus {
  return { ...base, profile: { ...base.profile, inGame: { appId, name } } };
}

describe("featuredSteamGame", () => {
  it("leads with the most played game when nothing is running", () => {
    expect(featuredSteamGame(base)).toBe(other);
  });

  it("leads with the running game, using its recent stats when known", () => {
    expect(featuredSteamGame(playing(1245620, "x"))).toBe(game);
  });

  it("builds an entry for a running game outside the recent list", () => {
    expect(featuredSteamGame(playing(7, "Portal"))).toEqual({
      appId: 7,
      name: "Portal",
      minutesTwoWeeks: 0,
      minutesTotal: 0,
      lastPlayedAt: null,
      icon: null,
      url: "https://store.steampowered.com/app/7/",
    });
  });

  it("returns null with no games at all", () => {
    expect(featuredSteamGame({ ...base, games: [] })).toBeNull();
  });
});

describe("steamLine", () => {
  const recent: SteamGame = { ...game, minutesTwoWeeks: 845, minutesTotal: 9000 };
  const old: SteamGame = { ...game, minutesTwoWeeks: 0, minutesTotal: 18720 };

  function status(games: SteamGame[], profile: Partial<SteamStatus["profile"]> = {}): SteamStatus {
    return { profile: { ...base.profile, ...profile }, games };
  }

  it("shows the game running now with its fortnight", () => {
    expect(steamLine(status([recent], { inGame: { appId: recent.appId, name: "x" } }))).toEqual({
      kind: "playing",
      game: recent,
      detail: "14h / 2w",
    });
  });

  it("shows the fortnight's playtime for a game played lately", () => {
    expect(steamLine(status([recent]))).toMatchObject({ kind: "recent", detail: "14h / 2w" });
  });

  it("falls back to lifetime hours for a game played longer ago", () => {
    expect(steamLine(status([old]))).toMatchObject({ kind: "lifetime", detail: "312h total" });
    expect(steamLine(status([{ ...old, minutesTotal: 0 }]))?.detail).toBeNull();
  });

  it("shows the profile when no game details are public", () => {
    expect(steamLine(status([], { isOnline: true }))).toEqual({
      kind: "profile",
      game: null,
      detail: "online",
    });
    expect(steamLine(status([]))?.detail).toBeNull();
    expect(steamLine(status([], { name: "" }))).toBeNull();
  });

  it("prints short sessions in minutes", () => {
    expect(formatPlaytime(45)).toBe("45m");
    expect(formatPlaytime(90)).toBe("2h");
  });
});
