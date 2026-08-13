import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { unstable_cache } from "next/cache";

import { fetchDiscogsCollection, isDiscogsUsername } from "../integrations/discogs";
import { fetchLetterboxdFilms, isLetterboxdUsername } from "../integrations/letterboxd";
import { fetchRecentTrophies, isPsnUsername } from "../integrations/psn-trophies";
import { getConfig } from "./config";
import { getSearchIndex } from "./search-index";

export const ACTIVITY_KINDS = {
  work: "work",
  film: "film",
  record: "record",
  trophy: "trophy",
} as const;

export type ActivityKind = (typeof ACTIVITY_KINDS)[keyof typeof ACTIVITY_KINDS];

export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  title: string;
  detail?: string;
  date: string;
  href?: string;
  thumb?: string;
}

const PER_SOURCE_LIMIT = 12;

const THIRD_PARTY_TTL = 900;

function cached<A extends string[]>(
  key: string,
  fetcher: (...args: A) => Promise<ActivityEntry[]>,
): (...args: A) => Promise<ActivityEntry[]> {
  return (...args: A) =>
    unstable_cache(() => fetcher(...args), ["activity", key, ...args], {
      revalidate: THIRD_PARTY_TTL,
    })();
}

export interface ActivityIssue {
  source: string;
  message: string;
}

export interface ActivitySources {
  work: ActivityEntry[];
  films: ActivityEntry[];
  records: ActivityEntry[];
  trophies: ActivityEntry[];
  issues: ActivityIssue[];
}

const EMPTY_SOURCES: ActivitySources = {
  work: [],
  films: [],
  records: [],
  trophies: [],
  issues: [],
};

async function settle<T>(label: string, task: Promise<T[]>, issues: ActivityIssue[]): Promise<T[]> {
  try {
    return await task;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Activity source "${label}" failed:`, error);
    captureServerException(error, { tags: { query: "activity", source: label } });
    issues.push({ source: label, message });
    return [];
  }
}

function toIso(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

async function workEntries(): Promise<ActivityEntry[]> {
  const documents = await getSearchIndex();
  return documents
    .filter((document) => document.kind === "work")
    .map((document): ActivityEntry | null => {
      const date = toIso(document.date);
      return date
        ? {
            id: `work:${document.id}`,
            kind: ACTIVITY_KINDS.work,
            title: document.title,
            detail: document.tags.slice(0, 3).join(", ") || undefined,
            date,
            href: document.href,
            thumb: document.media?.find((item) => item.kind === "image" && item.thumb)?.thumb,
          }
        : null;
    })
    .filter((entry) => entry !== null)
    .sort(byDateDesc)
    .slice(0, PER_SOURCE_LIMIT);
}

async function filmEntries(username: string): Promise<ActivityEntry[]> {
  const result = await fetchLetterboxdFilms(username, PER_SOURCE_LIMIT);
  if (!result.ok) {
    throw new Error(`Letterboxd ${result.status}: ${result.message}`);
  }

  return result.films
    .map((film): ActivityEntry | null => {
      const date = toIso(film.watchedDate);
      return date
        ? {
            id: `film:${film.url}`,
            kind: ACTIVITY_KINDS.film,
            title: film.year ? `${film.title} (${film.year})` : film.title,
            detail: filmDetail(film.rating, film.rewatch),
            date,
            href: film.url,
            thumb: film.poster ?? undefined,
          }
        : null;
    })
    .filter((entry) => entry !== null);
}

function filmDetail(rating: number | null, rewatch: boolean): string | undefined {
  const parts: string[] = [];
  if (rating !== null) {
    parts.push("★".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "½" : ""));
  }
  if (rewatch) {
    parts.push("rewatch");
  }
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

async function recordEntries(username: string): Promise<ActivityEntry[]> {
  const result = await fetchDiscogsCollection(username, PER_SOURCE_LIMIT);
  if (!result.ok) {
    throw new Error(`Discogs ${result.status}: ${result.message}`);
  }

  return result.releases
    .map((release): ActivityEntry | null => {
      const date = toIso(release.addedAt);
      return date
        ? {
            id: `record:${release.url}`,
            kind: ACTIVITY_KINDS.record,
            title: `${release.artist} — ${release.title}`,
            detail: [release.format, release.year].filter(Boolean).join(", ") || undefined,
            date,
            href: release.url,
            thumb: release.thumb ?? undefined,
          }
        : null;
    })
    .filter((entry) => entry !== null);
}

async function trophyEntries(npsso: string, username?: string): Promise<ActivityEntry[]> {
  const result = await fetchRecentTrophies(npsso, username);
  if (!result.ok) {
    throw new Error(`PSN ${result.status} (${result.reason}): ${result.message}`);
  }

  return result.trophies
    .map((trophy): ActivityEntry | null => {
      const date = toIso(trophy.earnedAt);
      return date
        ? {
            id: `trophy:${trophy.game}:${trophy.name}`,
            kind: ACTIVITY_KINDS.trophy,
            title: trophy.name,
            detail: [trophy.type, trophy.game].filter(Boolean).join(" · "),
            date,
            href: trophy.url,
            thumb: trophy.image ?? undefined,
          }
        : null;
    })
    .filter((entry) => entry !== null);
}

const cachedFilms = cached("letterboxd", filmEntries);
const cachedRecords = cached("discogs", recordEntries);
const cachedTrophies = cached("psn", (username: string) =>
  trophyEntries(env.PSN_NPSSO ?? "", username || undefined),
);

interface ActivityConfig {
  letterboxd?: string;
  discogs?: string;
  hasPsn: boolean;
  psnUsername: string;
}

export function resolveActivityConfig(config: {
  letterboxd_enabled?: boolean;
  letterboxd_username?: string;
  discogs_enabled?: boolean;
  discogs_username?: string;
  psn_trophy_enabled?: boolean;
  psn_username?: string;
}): ActivityConfig {
  return {
    letterboxd:
      (config.letterboxd_enabled ?? true) && isLetterboxdUsername(config.letterboxd_username)
        ? config.letterboxd_username
        : undefined,
    discogs:
      (config.discogs_enabled ?? false) && isDiscogsUsername(config.discogs_username)
        ? config.discogs_username
        : undefined,
    hasPsn: Boolean((config.psn_trophy_enabled ?? false) && env.PSN_NPSSO),
    psnUsername: isPsnUsername(config.psn_username) ? config.psn_username : "",
  };
}

export async function getActivitySources(): Promise<ActivitySources> {
  const config = await getConfig().catch((error) => {
    console.warn("Activity config lookup failed:", error);
    return null;
  });
  if (!config) {
    return {
      ...EMPTY_SOURCES,
      issues: [{ source: "config", message: "Storyblok config missing" }],
    };
  }

  const issues: ActivityIssue[] = [];
  const { letterboxd, discogs, hasPsn, psnUsername } = resolveActivityConfig(config);

  const [work, films, records, trophies] = await Promise.all([
    settle("work", workEntries(), issues),
    letterboxd ? settle("letterboxd", cachedFilms(letterboxd), issues) : [],
    discogs ? settle("discogs", cachedRecords(discogs), issues) : [],
    hasPsn ? settle("psn", cachedTrophies(psnUsername), issues) : [],
  ]);

  return { work, films, records, trophies, issues };
}

export function mergeActivity(sources: ActivitySources, limit = 40): ActivityEntry[] {
  return [...sources.work, ...sources.films, ...sources.records, ...sources.trophies]
    .sort(byDateDesc)
    .slice(0, limit);
}

function byDateDesc(a: ActivityEntry, b: ActivityEntry): number {
  return b.date.localeCompare(a.date) || a.id.localeCompare(b.id);
}
