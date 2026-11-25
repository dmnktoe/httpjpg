import type { SteamGame, SteamStatus } from "./steam";

export type SteamLineKind = "playing" | "recent" | "lifetime" | "profile";

export interface SteamLine {
  kind: SteamLineKind;
  game: SteamGame | null;
  detail: string | null;
}

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
      lastPlayedAt: null,
      icon: null,
      url: `https://store.steampowered.com/app/${inGame.appId}/`,
    }
  );
}

export function formatPlaytime(minutes: number): string {
  return minutes < 60 ? `${minutes}m` : `${Math.round(minutes / 60)}h`;
}

export function steamLine(status: SteamStatus): SteamLine | null {
  const game = featuredSteamGame(status);
  if (!game) {
    return status.profile.name
      ? { kind: "profile", game: null, detail: status.profile.isOnline ? "online" : null }
      : null;
  }
  const recent = game.minutesTwoWeeks > 0 ? `${formatPlaytime(game.minutesTwoWeeks)} / 2w` : null;
  if (status.profile.inGame?.appId === game.appId) {
    return { kind: "playing", game, detail: recent };
  }
  if (recent) {
    return { kind: "recent", game, detail: recent };
  }
  return {
    kind: "lifetime",
    game,
    detail: game.minutesTotal > 0 ? `${formatPlaytime(game.minutesTotal)} total` : null,
  };
}
