import type { SteamGame, SteamStatus } from "./steam";
import { featuredSteamGame } from "./steam-game";

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
  profile: { name: "d", avatar: null, url: "u", inGame: null },
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
