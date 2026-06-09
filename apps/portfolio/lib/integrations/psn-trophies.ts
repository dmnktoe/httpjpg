import {
  exchangeCodeForAccessToken,
  exchangeNpssoForCode,
  exchangeRefreshTokenForAuthTokens,
  getTitleTrophies,
  getUserTitles,
  getUserTrophiesEarnedForTitle,
  type AuthorizationPayload,
  type TrophyTitle,
} from "psn-api";

export const TROPHY_TYPES = ["bronze", "silver", "gold", "platinum"] as const;
export type TrophyType = (typeof TROPHY_TYPES)[number];

export interface PsnTrophy {
  name: string;
  game: string;
  platform: string | null;
  type: TrophyType;
  description: string | null;
  earnedAt: string | null;
  url: string;
  avatar: string | null;
}

export type PsnTrophyFetchResult =
  | { ok: true; trophies: PsnTrophy[] }
  | { ok: false; status: number; message: string };

const PSN_USERNAME = /^[A-Za-z][\w-]{2,15}$/;

export function isPsnUsername(value: unknown): value is string {
  return typeof value === "string" && PSN_USERNAME.test(value);
}

function toTrophyType(value: string | undefined): TrophyType | null {
  const type = value?.toLowerCase();
  return TROPHY_TYPES.includes(type as TrophyType) ? (type as TrophyType) : null;
}

function profileUrl(username?: string): string {
  return username && isPsnUsername(username)
    ? `https://psnprofiles.com/${username}`
    : "https://www.playstation.com";
}

function countEarned(counts: {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
}): number {
  return counts.bronze + counts.silver + counts.gold + counts.platinum;
}

export function buildTrophy(
  title: Pick<TrophyTitle, "trophyTitleName" | "trophyTitlePlatform" | "trophyTitleIconUrl">,
  earned: { trophyType?: string; earnedDateTime?: string | null },
  definition: { trophyName?: string; trophyDetail?: string | null } | undefined,
  username?: string,
): PsnTrophy | null {
  const type = toTrophyType(earned.trophyType);
  if (!type) {
    return null;
  }
  return {
    name: definition?.trophyName ?? "",
    game: title.trophyTitleName,
    platform: title.trophyTitlePlatform?.split(",")[0] ?? null,
    type,
    description: definition?.trophyDetail ?? null,
    earnedAt: earned.earnedDateTime ?? null,
    url: profileUrl(username),
    avatar: title.trophyTitleIconUrl ?? null,
  };
}

interface CachedAuth {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
}

let cachedAuth: CachedAuth | null = null;

const AUTH_SKEW_MS = 60_000;

async function authorize(npsso: string): Promise<AuthorizationPayload> {
  const now = Date.now();

  if (cachedAuth && cachedAuth.accessTokenExpiresAt > now + AUTH_SKEW_MS) {
    return { accessToken: cachedAuth.accessToken };
  }

  const tokens =
    cachedAuth && cachedAuth.refreshTokenExpiresAt > now + AUTH_SKEW_MS
      ? await exchangeRefreshTokenForAuthTokens(cachedAuth.refreshToken)
      : await exchangeCodeForAccessToken(await exchangeNpssoForCode(npsso));

  cachedAuth = {
    accessToken: tokens.accessToken,
    accessTokenExpiresAt: now + tokens.expiresIn * 1000,
    refreshToken: tokens.refreshToken,
    refreshTokenExpiresAt: now + tokens.refreshTokenExpiresIn * 1000,
  };
  return { accessToken: cachedAuth.accessToken };
}

export async function fetchLatestTrophy(
  npsso: string,
  username?: string,
): Promise<PsnTrophyFetchResult> {
  try {
    const auth = await authorize(npsso);

    const { trophyTitles } = await getUserTitles(auth, "me");
    const title = trophyTitles
      .filter((candidate) => countEarned(candidate.earnedTrophies) > 0)
      .sort((a, b) => b.lastUpdatedDateTime.localeCompare(a.lastUpdatedDateTime))[0];
    if (!title) {
      console.warn(`PSN: no title with earned trophies (titles=${trophyTitles.length})`);
      return { ok: true, trophies: [] };
    }

    const options = { npServiceName: title.npServiceName };
    const [earnedResult, definitionResult] = await Promise.all([
      getUserTrophiesEarnedForTitle(auth, "me", title.npCommunicationId, "all", options),
      getTitleTrophies(auth, title.npCommunicationId, "all", options),
    ]);

    const latest = earnedResult.trophies
      .filter((trophy) => trophy.earned && trophy.earnedDateTime)
      .sort((a, b) => (b.earnedDateTime ?? "").localeCompare(a.earnedDateTime ?? ""))[0];
    if (!latest) {
      return { ok: true, trophies: [] };
    }

    const definition = definitionResult.trophies.find(
      (trophy) => trophy.trophyId === latest.trophyId,
    );
    const trophy = buildTrophy(title, latest, definition, username);
    return { ok: true, trophies: trophy ? [trophy] : [] };
  } catch (error) {
    cachedAuth = null;
    const message = error instanceof Error ? error.message : "Unknown PSN API error";
    return { ok: false, status: 502, message };
  }
}
