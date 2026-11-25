import { fetchWithTimeout, readJson } from "./http";
import { PIXEL_GRID, pixelateEach, pixelateImage } from "./pixelate";

export interface SteamGame {
  appId: number;
  name: string;
  minutesTwoWeeks: number;
  minutesTotal: number;
  lastPlayedAt: string | null;
  icon: string | null;
  url: string;
}

export interface SteamProfile {
  name: string;
  avatar: string | null;
  url: string;
  isOnline: boolean;
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
  personastate?: number;
  gameid?: string;
  gameextrainfo?: string;
}

interface SteamPlayerSummariesResponse {
  response?: { players?: SteamPlayer[] };
}

interface SteamOwnedGame {
  appid?: number;
  name?: string;
  playtime_2weeks?: number;
  playtime_forever?: number;
  img_icon_url?: string;
  rtime_last_played?: number;
}

interface SteamOwnedGamesResponse {
  response?: { games?: SteamOwnedGame[] };
}

interface SteamVanityResponse {
  response?: { success?: number; steamid?: string };
}

const DEFAULT_LIMIT = 4;
const API_URL = "https://api.steampowered.com";

const STEAM_ID = /^7656119\d{10}$/;
const STEAM_VANITY = /^[\w-]{2,32}$/;

export function isSteamId(value: unknown): value is string {
  return typeof value === "string" && STEAM_ID.test(value);
}

export function isSteamProfile(value: unknown): value is string {
  return typeof value === "string" && (STEAM_ID.test(value) || STEAM_VANITY.test(value));
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
    isOnline: (player.personastate ?? 0) > 0,
    inGame:
      Number.isFinite(appId) && player.gameextrainfo ? { appId, name: player.gameextrainfo } : null,
  };
}

export function parseOwnedGames(body: SteamOwnedGamesResponse, limit = DEFAULT_LIMIT): SteamGame[] {
  if (limit <= 0) {
    return [];
  }
  return (body.response?.games ?? [])
    .filter((game) => game.appid && game.name && (game.rtime_last_played ?? 0) > 0)
    .sort((a, b) => (b.rtime_last_played ?? 0) - (a.rtime_last_played ?? 0))
    .slice(0, limit)
    .map((game) => {
      const appId = game.appid as number;
      return {
        appId,
        name: game.name as string,
        minutesTwoWeeks: game.playtime_2weeks ?? 0,
        minutesTotal: game.playtime_forever ?? 0,
        lastPlayedAt: new Date((game.rtime_last_played as number) * 1000).toISOString(),
        icon: iconUrl(appId, game.img_icon_url),
        url: storeUrl(appId),
      };
    });
}

async function resolveSteamId(
  profile: string,
  apiKey: string,
  hint: string,
): Promise<{ ok: true; steamId: string } | { ok: false; status: number; message: string }> {
  if (isSteamId(profile)) {
    return { ok: true, steamId: profile };
  }
  const params = new URLSearchParams({ key: apiKey, vanityurl: profile });
  const result = await fetchWithTimeout(`${API_URL}/ISteamUser/ResolveVanityURL/v1/?${params}`, {
    label: "Steam",
    hint,
  });
  if (!result.ok) {
    return result;
  }
  const body = await readJson<SteamVanityResponse>(result.response, "Steam");
  if (!body.ok) {
    return body;
  }
  const steamId = body.data?.response?.steamid;
  if (body.data?.response?.success !== 1 || !isSteamId(steamId)) {
    return { ok: false, status: 404, message: `No Steam profile named ${profile}. ${hint}` };
  }
  return { ok: true, steamId };
}

export async function fetchSteamStatus(
  profile: string,
  apiKey: string,
  limit = DEFAULT_LIMIT,
): Promise<SteamFetchResult> {
  const hint =
    "Check STEAM_API_KEY, the SteamID64 or profile name, and that game details are public.";
  const resolved = await resolveSteamId(profile, apiKey, hint);
  if (!resolved.ok) {
    return resolved;
  }
  const { steamId } = resolved;

  const summaries = new URLSearchParams({ key: apiKey, steamids: steamId });
  const owned = new URLSearchParams({
    key: apiKey,
    steamid: steamId,
    include_appinfo: "1",
    include_played_free_games: "1",
    format: "json",
  });

  const [summaryResult, ownedResult] = await Promise.all([
    fetchWithTimeout(`${API_URL}/ISteamUser/GetPlayerSummaries/v2/?${summaries}`, {
      label: "Steam",
      hint,
    }),
    fetchWithTimeout(`${API_URL}/IPlayerService/GetOwnedGames/v1/?${owned}`, {
      label: "Steam",
      hint,
    }),
  ]);
  if (!summaryResult.ok) {
    return summaryResult;
  }
  if (!ownedResult.ok) {
    return ownedResult;
  }

  const [summaryBody, ownedBody] = await Promise.all([
    readJson<SteamPlayerSummariesResponse>(summaryResult.response, "Steam"),
    readJson<SteamOwnedGamesResponse>(ownedResult.response, "Steam"),
  ]);
  if (!summaryBody.ok) {
    return summaryBody;
  }
  if (!ownedBody.ok) {
    return ownedBody;
  }

  const player = parsePlayer(summaryBody.data ?? {}, steamId);
  if (!player) {
    return { ok: false, status: 404, message: `No Steam profile for ${steamId}. ${hint}` };
  }

  const grid = { width: PIXEL_GRID.thumb, height: PIXEL_GRID.thumb };
  const [avatar, games] = await Promise.all([
    pixelateImage(player.avatar, grid),
    pixelateEach(parseOwnedGames(ownedBody.data ?? {}, limit), "icon", grid),
  ]);
  return { ok: true, status: { profile: { ...player, avatar }, games } };
}
