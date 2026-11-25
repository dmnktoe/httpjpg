import type { SteamGame, SteamStatus } from "./steam";

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
