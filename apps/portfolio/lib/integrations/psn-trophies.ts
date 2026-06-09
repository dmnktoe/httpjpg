// PSN trophies come from Sony's official trophy API via `psn-api`, authenticated
// with an NPSSO token (PSN_NPSSO). This avoids the Cloudflare-blocked third-party
// scrapers entirely and returns first-party data. The NPSSO is exchanged for
// short-lived auth tokens which are cached and refreshed between requests.

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

// PSN online IDs are 3–16 chars, start with a letter, then letters/digits/-/_.
// Validated before it reaches the profile link.
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

// Merge a title, the user's earned record, and the trophy definition into the
// widget's shape. Returns null when the tier is unrecognisable.
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

// Re-auth a minute before expiry so a request never races the boundary.
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

// The most recently earned trophy lives in the most recently updated title, so
// only that title's trophy set has to be fetched.
export async function fetchLatestTrophy(
  npsso: string,
  username?: string,
): Promise<PsnTrophyFetchResult> {
  try {
    const auth = await authorize(npsso);

    const { trophyTitles } = await getUserTitles(auth, "me");
    const title = [...trophyTitles].sort((a, b) =>
      b.lastUpdatedDateTime.localeCompare(a.lastUpdatedDateTime),
    )[0];
    if (!title) {
      console.warn(`PSN: no titles returned for account (count=${trophyTitles.length})`);
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
      console.warn(
        `PSN: no earned trophy in latest title "${title.trophyTitleName}" ` +
          `(npServiceName=${title.npServiceName}, returned=${earnedResult.trophies.length}, ` +
          `earned=${earnedResult.trophies.filter((t) => t.earned).length})`,
      );
      return { ok: true, trophies: [] };
    }

    const definition = definitionResult.trophies.find(
      (trophy) => trophy.trophyId === latest.trophyId,
    );
    const trophy = buildTrophy(title, latest, definition, username);
    return { ok: true, trophies: trophy ? [trophy] : [] };
  } catch (error) {
    // Drop the cached auth so a bad/expired token is re-exchanged next time.
    cachedAuth = null;
    const message = error instanceof Error ? error.message : "Unknown PSN API error";
    return { ok: false, status: 502, message };
  }
}
