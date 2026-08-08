import {
  exchangeCodeForAccessToken,
  exchangeNpssoForCode,
  exchangeRefreshTokenForAuthTokens,
  getProfileFromAccountId,
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
  image: string | null;
}

export type PsnFailureReason = "auth" | "upstream";

export type PsnTrophyFetchResult =
  | { ok: true; trophies: PsnTrophy[]; avatar: string | null }
  | {
      ok: false;
      status: number;
      reason: PsnFailureReason;
      message: string;
      error: unknown;
      reportable: boolean;
    };

export class PsnAuthError extends Error {
  readonly status = 503;
  readonly replayed: boolean;

  constructor(message: string, options?: { cause?: unknown; replayed?: boolean }) {
    super(message, { cause: options?.cause });
    this.name = "PsnAuthError";
    this.replayed = options?.replayed ?? false;
  }
}

const RECENT_LIMIT = 5;
const TITLE_SCAN = 5;
const AVATAR_SIZES = ["xl", "l", "m", "s", "xs"];

const LANGUAGE_HEADERS = { "Accept-Language": "en-US" };

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

function pickAvatar(avatars?: Array<{ size: string; url: string }>): string | null {
  if (!avatars?.length) {
    return null;
  }
  for (const size of AVATAR_SIZES) {
    const match = avatars.find((avatar) => avatar.size === size);
    if (match) {
      return match.url;
    }
  }
  return avatars[0].url;
}

export function buildTrophy(
  title: Pick<TrophyTitle, "trophyTitleName" | "trophyTitlePlatform">,
  earned: { trophyType?: string; earnedDateTime?: string | null },
  definition:
    | { trophyName?: string; trophyDetail?: string | null; trophyIconUrl?: string | null }
    | undefined,
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
    image: definition?.trophyIconUrl ?? null,
  };
}

interface CachedAuth {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
}

interface PsnAuthTokens {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
  refreshTokenExpiresIn?: number;
}

let cachedAuth: CachedAuth | null = null;
let authBlockedUntil = 0;

const AUTH_SKEW_MS = 60_000;
const AUTH_COOLDOWN_MS = 5 * 60_000;

function toAuthTokens(payload: unknown, source: string): PsnAuthTokens {
  const tokens = payload as Partial<PsnAuthTokens> | null | undefined;
  if (!tokens?.accessToken || !Number.isFinite(tokens.expiresIn)) {
    throw new PsnAuthError(`PSN ${source} returned no usable access token`);
  }
  return {
    accessToken: tokens.accessToken,
    expiresIn: tokens.expiresIn as number,
    refreshToken: tokens.refreshToken,
    refreshTokenExpiresIn: Number.isFinite(tokens.refreshTokenExpiresIn)
      ? tokens.refreshTokenExpiresIn
      : undefined,
  };
}

async function exchangeNpsso(npsso: string): Promise<PsnAuthTokens> {
  try {
    return toAuthTokens(
      await exchangeCodeForAccessToken(await exchangeNpssoForCode(npsso)),
      "code exchange",
    );
  } catch (error) {
    if (error instanceof PsnAuthError) {
      throw error;
    }
    throw new PsnAuthError("PSN rejected the NPSSO token — it is expired or malformed", {
      cause: error,
    });
  }
}

export function resetPsnAuthCache(): void {
  cachedAuth = null;
  authBlockedUntil = 0;
}

async function authorize(npsso: string): Promise<AuthorizationPayload> {
  const now = Date.now();

  if (cachedAuth && cachedAuth.accessTokenExpiresAt > now + AUTH_SKEW_MS) {
    return { accessToken: cachedAuth.accessToken };
  }

  if (now < authBlockedUntil) {
    throw new PsnAuthError("PSN credentials were rejected recently — retrying later", {
      replayed: true,
    });
  }

  const refreshToken =
    cachedAuth && cachedAuth.refreshTokenExpiresAt > now + AUTH_SKEW_MS
      ? cachedAuth.refreshToken
      : null;

  cachedAuth = null;

  try {
    const refreshed = refreshToken
      ? await exchangeRefreshTokenForAuthTokens(refreshToken)
          .then((tokens) => toAuthTokens(tokens, "token refresh"))
          .catch(() => null)
      : null;
    const tokens = refreshed ?? (await exchangeNpsso(npsso));

    cachedAuth = {
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: now + tokens.expiresIn * 1000,
      refreshToken: tokens.refreshToken ?? "",
      refreshTokenExpiresAt: tokens.refreshTokenExpiresIn
        ? now + tokens.refreshTokenExpiresIn * 1000
        : 0,
    };
    return { accessToken: cachedAuth.accessToken };
  } catch (error) {
    if (error instanceof PsnAuthError) {
      authBlockedUntil = now + AUTH_COOLDOWN_MS;
    }
    throw error;
  }
}

export async function fetchRecentTrophies(
  npsso: string,
  username?: string,
): Promise<PsnTrophyFetchResult> {
  try {
    const auth = await authorize(npsso);

    const [{ trophyTitles }, profile] = await Promise.all([
      getUserTitles(auth, "me", { headerOverrides: LANGUAGE_HEADERS }),
      getProfileFromAccountId(auth, "me").catch(() => null),
    ]);
    const avatar = pickAvatar(profile?.avatars);

    const titles = trophyTitles
      .filter((title) => countEarned(title.earnedTrophies) > 0)
      .sort((a, b) => b.lastUpdatedDateTime.localeCompare(a.lastUpdatedDateTime))
      .slice(0, TITLE_SCAN);

    const earnedByTitle = await Promise.all(
      titles.map(async (title) => {
        const options = {
          npServiceName: title.npServiceName,
          headerOverrides: LANGUAGE_HEADERS,
        };
        const [earnedResult, definitionResult] = await Promise.all([
          getUserTrophiesEarnedForTitle(auth, "me", title.npCommunicationId, "all", options),
          getTitleTrophies(auth, title.npCommunicationId, "all", options),
        ]);
        const definitions = new Map(
          definitionResult.trophies.map((trophy) => [trophy.trophyId, trophy]),
        );
        return earnedResult.trophies
          .filter((trophy) => trophy.earned && trophy.earnedDateTime)
          .map((trophy) => ({
            title,
            earned: trophy,
            definition: definitions.get(trophy.trophyId),
          }));
      }),
    );

    const trophies = earnedByTitle
      .flat()
      .sort((a, b) => (b.earned.earnedDateTime ?? "").localeCompare(a.earned.earnedDateTime ?? ""))
      .slice(0, RECENT_LIMIT)
      .map((entry) => buildTrophy(entry.title, entry.earned, entry.definition, username))
      .filter((trophy): trophy is PsnTrophy => trophy !== null);

    return { ok: true, trophies, avatar };
  } catch (error) {
    const isAuthFailure = error instanceof PsnAuthError;
    return {
      ok: false,
      status: isAuthFailure ? 503 : 502,
      reason: isAuthFailure ? "auth" : "upstream",
      message: isAuthFailure
        ? "PSN credentials rejected — set a fresh PSN_NPSSO"
        : "PSN trophies unavailable",
      error,
      reportable: !(isAuthFailure && (error as PsnAuthError).replayed),
    };
  }
}
