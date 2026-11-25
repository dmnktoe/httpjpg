import { fetchWithTimeout, readJson } from "./http";
import { PIXEL_GRID, pixelateEach, pixelateImage } from "./pixelate";

export interface SteamGame {
  appId: number;
  name: string;
  /** Minutes played in the last two weeks. */
  minutesTwoWeeks: number;
  minutesTotal: number;
  icon: string | null;
  url: string;
}

export interface SteamProfile {
  name: string;
  avatar: string | null;
  url: string;
  /** The game running right now, when the profile shows it. */
  inGame: { appId: number; name: string } | null;
}

export interface SteamStatus {
  profile: SteamProfile;
  games: SteamGame[];
}

export type SteamFetchResult =
  | { ok: true; status: SteamStatus }
  | { ok: false; status: number; message: string };

interface SteamPlayer {
  personaname?: string;
  profileurl?: string;
  avatarfull?: string;
  avatarmedium?: string;
  gameid?: string;
  gameextrainfo?: string;
}

interface SteamPlayerSummariesResponse {
  response?: { players?: SteamPlayer[] };
}

interface SteamRecentGame {
  appid?: number;
  name?: string;
  playtime_2weeks?: number;
  playtime_forever?: number;
  img_icon_url?: string;
}

interface SteamRecentGamesResponse {
  // A private profile answers `{ response: {} }` rather than an error.
  response?: { games?: SteamRecentGame[] };
}

const DEFAULT_LIMIT = 4;
const API_URL = "https://api.steampowered.com";

// SteamID64: the individual-account base 76561197960265728 plus the account id.
const STEAM_ID = /^7656119\d{10}$/;

export function isSteamId(value: unknown): value is string {
  return typeof value === "string" && STEAM_ID.test(value);
}

function storeUrl(appId: number): string {
  return `https://store.steampowered.com/app/${appId}/`;
}

function iconUrl(appId: number, hash: string | undefined): string | null {
  return hash
    ? `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${hash}.jpg`
    : null;
}

export function parsePlayer(
  body: SteamPlayerSummariesResponse,
  steamId: string,
): SteamProfile | null {
  const player = body.response?.players?.[0];
  if (!player?.personaname) {
    return null;
  }
  const appId = player.gameid ? Number.parseInt(player.gameid, 10) : Number.NaN;
  return {
    name: player.personaname,
    avatar: player.avatarfull || player.avatarmedium || null,
    url: player.profileurl || `https://steamcommunity.com/profiles/${steamId}/`,
    inGame:
      Number.isFinite(appId) && player.gameextrainfo ? { appId, name: player.gameextrainfo } : null,
  };
}

export function parseRecentGames(
  body: SteamRecentGamesResponse,
  limit = DEFAULT_LIMIT,
): SteamGame[] {
  if (limit <= 0) {
    return [];
  }
  const games: SteamGame[] = [];
  for (const game of body.response?.games ?? []) {
    if (!game.appid || !game.name) {
      continue;
    }
    games.push({
      appId: game.appid,
      name: game.name,
      minutesTwoWeeks: game.playtime_2weeks ?? 0,
      minutesTotal: game.playtime_forever ?? 0,
      icon: iconUrl(game.appid, game.img_icon_url),
      url: storeUrl(game.appid),
    });
  }
  return games.slice(0, limit);
}

export async function fetchSteamStatus(
  steamId: string,
  apiKey: string,
  limit = DEFAULT_LIMIT,
): Promise<SteamFetchResult> {
  const hint = "Check STEAM_API_KEY, the SteamID64, and that game details are public.";
  const summaries = new URLSearchParams({ key: apiKey, steamids: steamId });
  const recent = new URLSearchParams({
    key: apiKey,
    steamid: steamId,
    count: String(Math.max(1, limit)),
    format: "json",
  });

  const [summaryResult, recentResult] = await Promise.all([
    fetchWithTimeout(`${API_URL}/ISteamUser/GetPlayerSummaries/v2/?${summaries}`, {
      label: "Steam",
      hint,
    }),
    fetchWithTimeout(`${API_URL}/IPlayerService/GetRecentlyPlayedGames/v1/?${recent}`, {
      label: "Steam",
      hint,
    }),
  ]);
  if (!summaryResult.ok) {
    return summaryResult;
  }
  if (!recentResult.ok) {
    return recentResult;
  }

  const [summaryBody, recentBody] = await Promise.all([
    readJson<SteamPlayerSummariesResponse>(summaryResult.response, "Steam"),
    readJson<SteamRecentGamesResponse>(recentResult.response, "Steam"),
  ]);
  if (!summaryBody.ok) {
    return summaryBody;
  }
  if (!recentBody.ok) {
    return recentBody;
  }

  const profile = parsePlayer(summaryBody.data ?? {}, steamId);
  if (!profile) {
    return { ok: false, status: 404, message: `No Steam profile for ${steamId}. ${hint}` };
  }

  const [avatar, games] = await Promise.all([
    pixelateImage(profile.avatar, { width: PIXEL_GRID.thumb, height: PIXEL_GRID.thumb }),
    pixelateEach(parseRecentGames(recentBody.data ?? {}, limit), "icon", {
      width: PIXEL_GRID.thumb,
      height: PIXEL_GRID.thumb,
    }),
  ]);
  return { ok: true, status: { profile: { ...profile, avatar }, games } };
}
