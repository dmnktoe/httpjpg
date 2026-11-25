import { env } from "@httpjpg/env";
import { cacheLife } from "next/cache";

import {
  type DiscogsRelease,
  fetchDiscogsCollection,
  isDiscogsUsername,
} from "../integrations/discogs";
import { fetchGithubActivity, type GithubStatus, isGithubUsername } from "../integrations/github";
import {
  fetchLastfmScrobbles,
  isLastfmUsername,
  type LastfmScrobbles,
} from "../integrations/lastfm";
import {
  fetchLetterboxdFilms,
  isLetterboxdUsername,
  type LetterboxdFilm,
} from "../integrations/letterboxd";
import { fetchRecentTrophies, isPsnUsername, type PsnTrophy } from "../integrations/psn-trophies";
import { readRedditKarma, type RedditKarma } from "../integrations/reddit";
import { fetchSchalkeStatus, type SchalkeStatus } from "../integrations/schalke";
import { fetchSteamStatus, isSteamId, type SteamStatus } from "../integrations/steam";
import { fetchXTimeline, isXUsername, type XTimeline } from "../integrations/x-posts";
import {
  fetchYoutubeStatus,
  isYoutubeChannelId,
  type YoutubeStatus,
} from "../integrations/youtube";
import { getConfig } from "./config";

/** Freshness per widget in seconds: edge `s-maxage` and cache lifetime alike. */
export const WIDGET_MAX_AGE = {
  discord: 30,
  weather: 900,
  letterboxd: 300,
  discogs: 900,
  lastfm: 120,
  steam: 300,
  youtube: 3600,
  github: 900,
  psnTrophies: 300,
  x: 3600,
  cloudflare: 900,
  schalke: 900,
} as const;

/** Edge window of the bundled envelope; each loader keeps its own upstream rate. */
export const WIDGET_STATUS_MAX_AGE = 60;

export interface WidgetStatus {
  letterboxd: { films: LetterboxdFilm[] } | null;
  discogs: { releases: DiscogsRelease[] } | null;
  lastfm: LastfmScrobbles | null;
  steam: SteamStatus | null;
  youtube: YoutubeStatus | null;
  github: GithubStatus | null;
  reddit: RedditKarma | null;
  x: XTimeline | null;
  trophies: { trophies: PsnTrophy[]; avatar: string | null } | null;
  schalke: SchalkeStatus | null;
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

async function readLastfm(username: string, apiKey: string) {
  "use cache";
  cacheLife({ revalidate: WIDGET_MAX_AGE.lastfm });
  const result = await fetchLastfmScrobbles(username, apiKey);
  return result.ok ? { tracks: result.tracks, total: result.total } : null;
}

async function readSteam(steamId: string, apiKey: string) {
  "use cache";
  cacheLife({ revalidate: WIDGET_MAX_AGE.steam });
  const result = await fetchSteamStatus(steamId, apiKey);
  return result.ok ? result.status : null;
}

async function readYoutube(channelId: string, apiKey: string) {
  "use cache";
  cacheLife({ revalidate: WIDGET_MAX_AGE.youtube });
  const result = await fetchYoutubeStatus(channelId, apiKey);
  return result.ok ? result.status : null;
}

async function readGithub(username: string, token: string | undefined) {
  "use cache";
  cacheLife({ revalidate: WIDGET_MAX_AGE.github });
  const result = await fetchGithubActivity(username, token);
  return result.ok ? result.status : null;
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

async function readSchalke() {
  "use cache";
  cacheLife({ revalidate: WIDGET_MAX_AGE.schalke });
  const result = await fetchSchalkeStatus();
  if (!result.ok) {
    return null;
  }
  const { fixture, upcoming, standing, url } = result;
  return { fixture, upcoming, standing, url };
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

/** Every slow-moving footer widget in one read: one connection instead of five. */
export async function getWidgetStatus(): Promise<WidgetStatus> {
  const config = await getConfig();

  const letterboxdUser = readSetting(config?.letterboxd_username, isLetterboxdUsername);
  const discogsUser = readSetting(config?.discogs_username, isDiscogsUsername);
  const lastfmUser = readSetting(config?.lastfm_username, isLastfmUsername);
  const steamId = readSetting(config?.steam_id, isSteamId);
  const youtubeChannel = readSetting(config?.youtube_channel_id, isYoutubeChannelId);
  const githubUser = readSetting(config?.github_username, isGithubUsername);
  const xUser = readSetting(config?.x_username, isXUsername);
  // Optional: narrows the lookup, PSN_NPSSO alone is enough.
  const psnUser = readSetting(config?.psn_username, isPsnUsername);

  // A switched-off widget never opens a request.
  const xApiKey = env.TWEETAPI_KEY;
  const lastfmApiKey = env.LASTFM_API_KEY;
  const steamApiKey = env.STEAM_API_KEY;
  const youtubeApiKey = env.YOUTUBE_API_KEY;
  const npsso = env.PSN_NPSSO;

  const letterboxdLoad =
    config?.letterboxd_enabled && letterboxdUser ? readLetterboxd(letterboxdUser) : null;
  const discogsLoad = config?.discogs_enabled && discogsUser ? readDiscogs(discogsUser) : null;
  const lastfmLoad =
    config?.lastfm_enabled && lastfmUser && lastfmApiKey
      ? readLastfm(lastfmUser, lastfmApiKey)
      : null;
  const steamLoad =
    config?.steam_enabled && steamId && steamApiKey ? readSteam(steamId, steamApiKey) : null;
  const youtubeLoad =
    config?.youtube_enabled && youtubeChannel && youtubeApiKey
      ? readYoutube(youtubeChannel, youtubeApiKey)
      : null;
  const githubLoad =
    config?.github_enabled && githubUser ? readGithub(githubUser, env.GITHUB_API_TOKEN) : null;
  const xLoad =
    config?.x_enabled && xUser && xApiKey ? readX(xUser, env.TWEETAPI_API_URL, xApiKey) : null;
  const trophiesLoad = config?.psn_trophy_enabled && npsso ? readTrophies(npsso, psnUser) : null;
  const schalkeLoad = config?.schalke_enabled ? readSchalke() : null;

  const [letterboxd, discogs, lastfm, steam, youtube, github, x, trophies, schalke] =
    await Promise.all([
      settle("letterboxd", letterboxdLoad),
      settle("discogs", discogsLoad),
      settle("lastfm", lastfmLoad),
      settle("steam", steamLoad),
      settle("youtube", youtubeLoad),
      settle("github", githubLoad),
      settle("x", xLoad),
      settle("psn-trophies", trophiesLoad),
      settle("schalke", schalkeLoad),
    ]);

  const reddit = config?.reddit_enabled
    ? readRedditKarma(config.reddit_username, config.reddit_karma)
    : null;

  return { letterboxd, discogs, lastfm, steam, youtube, github, reddit, x, trophies, schalke };
}
