import { fetchWithTimeout, readJson } from "./http";

export interface DiscogsRelease {
  title: string;
  artist: string;
  year: string | null;
  format: string | null;
  addedAt: string | null;
  url: string;
  thumb: string | null;
}

export type DiscogsFetchResult =
  | { ok: true; releases: DiscogsRelease[] }
  | { ok: false; status: number; message: string };

interface DiscogsArtist {
  name?: string;
  anv?: string;
}

interface DiscogsFormat {
  name?: string;
  descriptions?: string[];
}

interface DiscogsBasicInformation {
  id?: number;
  title?: string;
  year?: number;
  thumb?: string;
  cover_image?: string;
  artists?: DiscogsArtist[];
  formats?: DiscogsFormat[];
}

interface DiscogsCollectionItem {
  id?: number;
  date_added?: string;
  basic_information?: DiscogsBasicInformation;
}

interface DiscogsCollectionResponse {
  releases?: DiscogsCollectionItem[];
}

const DEFAULT_LIMIT = 4;
const USER_AGENT = "httpjpg.com/1.0 (+https://www.httpjpg.com)";

const DISCOGS_USERNAME = /^[A-Za-z0-9][\w.-]{1,31}$/;

export function isDiscogsUsername(value: unknown): value is string {
  return typeof value === "string" && DISCOGS_USERNAME.test(value);
}

function cleanArtistName(name: string): string {
  return name.replace(/\s*\(\d+\)$/, "").trim();
}

export function formatArtists(artists: DiscogsArtist[] | undefined): string {
  const names = (artists ?? [])
    .map((artist) => cleanArtistName(artist.anv?.trim() || artist.name?.trim() || ""))
    .filter((name) => name.length > 0);

  if (names.length === 0) {
    return "Unknown Artist";
  }
  if (names.length <= 2) {
    return names.join(" & ");
  }
  return `${names[0]} & others`;
}

export function formatRelease(format: DiscogsFormat | undefined): string | null {
  if (!format?.name) {
    return null;
  }
  const description = format.descriptions?.find((entry) => entry.trim().length > 0);
  return description ? `${format.name} ${description}` : format.name;
}

export function parseCollection(
  body: DiscogsCollectionResponse,
  limit = DEFAULT_LIMIT,
): DiscogsRelease[] {
  if (limit <= 0) {
    return [];
  }

  const releases: DiscogsRelease[] = [];

  for (const item of body.releases ?? []) {
    const info = item.basic_information;
    const releaseId = info?.id ?? item.id;
    if (!info?.title || !releaseId) {
      continue;
    }

    releases.push({
      title: info.title,
      artist: formatArtists(info.artists),
      year: info.year && info.year > 0 ? String(info.year) : null,
      format: formatRelease(info.formats?.[0]),
      addedAt: item.date_added ?? null,
      url: `https://www.discogs.com/release/${releaseId}`,
      thumb: info.thumb || info.cover_image || null,
    });
  }

  return releases.slice(0, limit);
}

export async function fetchDiscogsCollection(
  username: string,
  limit = DEFAULT_LIMIT,
): Promise<DiscogsFetchResult> {
  const url =
    `https://api.discogs.com/users/${encodeURIComponent(username)}/collection/folders/0/releases` +
    `?sort=added&sort_order=desc&per_page=${Math.max(1, limit)}`;

  const result = await fetchWithTimeout(url, {
    label: "Discogs",
    hint: "Check the Discogs username and that the collection is public.",
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!result.ok) {
    return result;
  }

  const body = await readJson<DiscogsCollectionResponse>(result.response, "Discogs");
  if (!body.ok) {
    return body;
  }

  return { ok: true, releases: parseCollection(body.data ?? {}, limit) };
}
