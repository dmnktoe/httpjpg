// Client-safe: the footer line imports this, so it must not pull in steam.ts
// and, through it, the server-only pixelation (sharp, DNS).
import type { SteamGame, SteamStatus } from "./steam";

/** The game the line leads with: the one running now, else the most played lately. */
export function featuredSteamGame(status: SteamStatus): SteamGame | null {
  const { inGame } = status.profile;
  if (!inGame) {
    return status.games[0] ?? null;
  }
  return (
    status.games.find((game) => game.appId === inGame.appId) ?? {
      appId: inGame.appId,
      name: inGame.name,
      minutesTwoWeeks: 0,
      minutesTotal: 0,
      icon: null,
      url: `https://store.steampowered.com/app/${inGame.appId}/`,
    }
  );
}
