import { env } from "@httpjpg/env";
import { cacheLife } from "next/cache";

import {
  type DiscogsRelease,
  fetchDiscogsCollection,
  isDiscogsUsername,
} from "../integrations/discogs";
import {
  fetchLetterboxdFilms,
  isLetterboxdUsername,
  type LetterboxdFilm,
} from "../integrations/letterboxd";
import { fetchRecentTrophies, isPsnUsername, type PsnTrophy } from "../integrations/psn-trophies";
import { fetchXTimeline, isXUsername, type XTimeline } from "../integrations/x-posts";
import { getConfig } from "./config";

/** Freshness per widget in seconds: edge `s-maxage` and cache lifetime alike. */
export const WIDGET_MAX_AGE = {
  discord: 30,
  weather: 900,
  letterboxd: 300,
  discogs: 900,
  psnTrophies: 300,
  x: 3600,
  cloudflare: 900,
} as const;

/** Edge window of the bundled envelope; each loader keeps its own upstream rate. */
export const WIDGET_STATUS_MAX_AGE = 60;

export interface WidgetStatus {
  letterboxd: { films: LetterboxdFilm[] } | null;
  discogs: { releases: DiscogsRelease[] } | null;
  x: XTimeline | null;
  trophies: { trophies: PsnTrophy[]; avatar: string | null } | null;
}

// Failures collapse to null: only plain-JSON successes are cached, and a widget
// that cannot load just leaves its line out.
async function readLetterboxd(username: string) {
  "use cache";
  cacheLife({ revalidate: WIDGET_MAX_AGE.letterboxd });
  const result = await fetchLetterboxdFilms(username);
  return result.ok ? { films: result.films } : null;
}

async function readDiscogs(username: string) {
  "use cache";
  cacheLife({ revalidate: WIDGET_MAX_AGE.discogs });
  const result = await fetchDiscogsCollection(username);
  return result.ok ? { releases: result.releases } : null;
}

async function readX(username: string, apiUrl: string, apiKey: string) {
  "use cache";
  cacheLife({ revalidate: WIDGET_MAX_AGE.x });
  const result = await fetchXTimeline({ apiUrl, apiKey, username });
  return result.ok ? result.timeline : null;
}

async function readTrophies(npsso: string, username?: string) {
  "use cache";
  cacheLife({ revalidate: WIDGET_MAX_AGE.psnTrophies });
  const result = await fetchRecentTrophies(npsso, username);
  return result.ok ? { trophies: result.trophies, avatar: result.avatar } : null;
}

/** Unlike `resolveWidgetSetting()`, no 501/503 split: the envelope has no status. */
function readSetting(
  value: string | undefined,
  validate: (candidate: string) => boolean,
): string | undefined {
  return value && validate(value) ? value : undefined;
}

/** Resolves one loader, keeping a thrown upstream from taking the envelope down. */
async function settle<T>(label: string, loader: Promise<T | null> | null): Promise<T | null> {
  if (!loader) {
    return null;
  }
  try {
    return await loader;
  } catch (error) {
    console.warn(`Widget status: ${label} failed to load:`, error);
    return null;
  }
}

/** Every slow-moving footer widget in one read: one connection instead of four. */
export async function getWidgetStatus(): Promise<WidgetStatus> {
  const config = await getConfig();

  const letterboxdUser = readSetting(config?.letterboxd_username, isLetterboxdUsername);
  const discogsUser = readSetting(config?.discogs_username, isDiscogsUsername);
  const xUser = readSetting(config?.x_username, isXUsername);
  // Optional: narrows the lookup, PSN_NPSSO alone is enough.
  const psnUser = readSetting(config?.psn_username, isPsnUsername);

  // A switched-off widget never opens a request.
  const xApiKey = env.TWEETAPI_KEY;
  const npsso = env.PSN_NPSSO;

  const letterboxdLoad =
    config?.letterboxd_enabled && letterboxdUser ? readLetterboxd(letterboxdUser) : null;
  const discogsLoad = config?.discogs_enabled && discogsUser ? readDiscogs(discogsUser) : null;
  const xLoad =
    config?.x_enabled && xUser && xApiKey ? readX(xUser, env.TWEETAPI_API_URL, xApiKey) : null;
  const trophiesLoad = config?.psn_trophy_enabled && npsso ? readTrophies(npsso, psnUser) : null;

  const [letterboxd, discogs, x, trophies] = await Promise.all([
    settle("letterboxd", letterboxdLoad),
    settle("discogs", discogsLoad),
    settle("x", xLoad),
    settle("psn-trophies", trophiesLoad),
  ]);

  return { letterboxd, discogs, x, trophies };
}
