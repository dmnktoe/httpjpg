import { env } from "@httpjpg/env";
import { unstable_cache } from "next/cache";

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

/**
 * How long each widget's data stays fresh, in seconds. Shared by the dedicated
 * routes (as their edge `s-maxage`) and by the data cache below, so a widget
 * has one freshness window rather than one per layer.
 */
export const WIDGET_MAX_AGE = {
  discord: 30,
  weather: 900,
  letterboxd: 300,
  discogs: 900,
  psnTrophies: 300,
  x: 3600,
} as const;

/**
 * The bundled envelope's own edge window. Short on purpose: the loaders below
 * hold each upstream at its own rate, so revalidating the envelope often costs
 * nothing beyond re-serialising cached values.
 */
export const WIDGET_STATUS_MAX_AGE = 60;

export interface WidgetStatus {
  letterboxd: { films: LetterboxdFilm[] } | null;
  discogs: { releases: DiscogsRelease[] } | null;
  x: XTimeline | null;
  trophies: { trophies: PsnTrophy[]; avatar: string | null } | null;
}

// The loaders deliberately collapse a failure to null. Only the success shape
// is cached, both because it is plain JSON — a PSN failure carries a raw Error,
// which does not survive serialisation — and because a widget that cannot load
// simply leaves its line out. The dedicated routes still report the real status.
const loadLetterboxd = unstable_cache(
  async (username: string) => {
    const result = await fetchLetterboxdFilms(username);
    return result.ok ? { films: result.films } : null;
  },
  ["widget-status", "letterboxd"],
  { revalidate: WIDGET_MAX_AGE.letterboxd },
);

const loadDiscogs = unstable_cache(
  async (username: string) => {
    const result = await fetchDiscogsCollection(username);
    return result.ok ? { releases: result.releases } : null;
  },
  ["widget-status", "discogs"],
  { revalidate: WIDGET_MAX_AGE.discogs },
);

const loadX = unstable_cache(
  async (username: string, apiUrl: string, apiKey: string) => {
    const result = await fetchXTimeline({ apiUrl, apiKey, username });
    return result.ok ? result.timeline : null;
  },
  ["widget-status", "x"],
  { revalidate: WIDGET_MAX_AGE.x },
);

const loadTrophies = unstable_cache(
  async (npsso: string, username?: string) => {
    const result = await fetchRecentTrophies(npsso, username);
    return result.ok ? { trophies: result.trophies, avatar: result.avatar } : null;
  },
  ["widget-status", "psn-trophies"],
  { revalidate: WIDGET_MAX_AGE.psnTrophies },
);

/** The setting when it is present and passes its validator, `undefined` otherwise. */
function readSetting(
  value: string | undefined,
  validate: (candidate: string) => boolean,
): string | undefined {
  return value && validate(value) ? value : undefined;
}

/** Resolves a loader to its value, or null if it is off or threw. */
async function settle<T>(loader: Promise<T | null> | undefined, label: string): Promise<T | null> {
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

/**
 * Every slow-moving footer widget's data in one read.
 *
 * The footer used to open one connection per widget on mount. Each upstream
 * keeps its own refresh rate through the data cache above, so bundling them
 * does not make any third-party API busier — it just stops the browser opening
 * four connections to say so.
 */
export async function getWidgetStatus(): Promise<WidgetStatus> {
  const config = await getConfig();

  const letterboxdUser = readSetting(config?.letterboxd_username, isLetterboxdUsername);
  const discogsUser = readSetting(config?.discogs_username, isDiscogsUsername);
  const xUser = readSetting(config?.x_username, isXUsername);
  const psnUser = readSetting(config?.psn_username, isPsnUsername);

  const [letterboxd, discogs, x, trophies] = await Promise.all([
    settle(
      config?.letterboxd_enabled && letterboxdUser ? loadLetterboxd(letterboxdUser) : undefined,
      "letterboxd",
    ),
    settle(
      config?.discogs_enabled && discogsUser ? loadDiscogs(discogsUser) : undefined,
      "discogs",
    ),
    settle(
      config?.x_enabled && xUser && env.TWEETAPI_KEY
        ? loadX(xUser, env.TWEETAPI_API_URL, env.TWEETAPI_KEY)
        : undefined,
      "x",
    ),
    settle(
      config?.psn_trophy_enabled && env.PSN_NPSSO
        ? loadTrophies(env.PSN_NPSSO, psnUser)
        : undefined,
      "psn-trophies",
    ),
  ]);

  return { letterboxd, discogs, x, trophies };
}
