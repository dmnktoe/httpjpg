import { fetchWithTimeout, readJson } from "./http";
import { PIXEL_GRID, pixelateEach } from "./pixelate";

export interface LastfmTrack {
  title: string;
  artist: string;
  album: string | null;
  url: string;
  image: string | null;
  nowPlaying: boolean;
  loved: boolean;
  /** ISO timestamp of the scrobble; null while the track is still playing. */
  scrobbledAt: string | null;
}

export interface LastfmScrobbles {
  tracks: LastfmTrack[];
  /** Lifetime scrobble count, when Last.fm reports it. */
  total: number | null;
}

export type LastfmFetchResult =
  | ({ ok: true } & LastfmScrobbles)
  | { ok: false; status: number; message: string };

interface LastfmImage {
  size?: string;
  "#text"?: string;
}

interface LastfmRecentTrack {
  name?: string;
  url?: string;
  loved?: string;
  artist?: { name?: string; "#text"?: string };
  album?: { "#text"?: string };
  image?: LastfmImage[];
  date?: { uts?: string };
  "@attr"?: { nowplaying?: string };
}

interface LastfmRecentTracksResponse {
  error?: number;
  message?: string;
  recenttracks?: {
    // A single scrobble arrives as an object rather than a one-item array.
    track?: LastfmRecentTrack[] | LastfmRecentTrack;
    "@attr"?: { total?: string };
  };
}

const DEFAULT_LIMIT = 4;
const API_URL = "https://ws.audioscrobbler.com/2.0/";

// Last.fm serves a grey star instead of leaving the image empty.
const PLACEHOLDER_IMAGE = "2a96cbd8b46e442fc41c2b86b821562f";

const IMAGE_SIZES = ["extralarge", "large", "medium", "small"] as const;

// Sign-up rules: 2–15 characters, a letter first, then letters, digits, _ or -.
const LASTFM_USERNAME = /^[A-Za-z][\w-]{1,14}$/;

export function isLastfmUsername(value: unknown): value is string {
  return typeof value === "string" && LASTFM_USERNAME.test(value);
}

function pickImage(images: LastfmImage[] | undefined): string | null {
  for (const size of IMAGE_SIZES) {
    const url = images?.find((image) => image.size === size)?.["#text"]?.trim();
    if (url && !url.includes(PLACEHOLDER_IMAGE)) {
      return url;
    }
  }
  return null;
}

function toIso(uts: string | undefined): string | null {
  const seconds = uts ? Number.parseInt(uts, 10) : Number.NaN;
  return Number.isFinite(seconds) ? new Date(seconds * 1000).toISOString() : null;
}

export function parseRecentTracks(
  body: LastfmRecentTracksResponse,
  limit = DEFAULT_LIMIT,
): LastfmScrobbles {
  const raw = body.recenttracks?.track;
  const items = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const totalText = body.recenttracks?.["@attr"]?.total;
  const total = totalText ? Number.parseInt(totalText, 10) : Number.NaN;

  const tracks: LastfmTrack[] = [];
  for (const item of items) {
    const title = item.name?.trim();
    const artist = (item.artist?.name ?? item.artist?.["#text"])?.trim();
    if (!title || !artist) {
      continue;
    }
    tracks.push({
      title,
      artist,
      album: item.album?.["#text"]?.trim() || null,
      url: item.url || "https://www.last.fm",
      image: pickImage(item.image),
      nowPlaying: item["@attr"]?.nowplaying === "true",
      loved: item.loved === "1",
      scrobbledAt: toIso(item.date?.uts),
    });
  }

  return {
    tracks: limit > 0 ? tracks.slice(0, limit) : [],
    total: Number.isFinite(total) ? total : null,
  };
}

export async function fetchLastfmScrobbles(
  username: string,
  apiKey: string,
  limit = DEFAULT_LIMIT,
): Promise<LastfmFetchResult> {
  const params = new URLSearchParams({
    method: "user.getrecenttracks",
    user: username,
    api_key: apiKey,
    format: "json",
    // `extended` adds the loved flag and names the artist as an object.
    extended: "1",
    limit: String(Math.max(1, limit)),
  });

  const result = await fetchWithTimeout(`${API_URL}?${params}`, {
    label: "Last.fm",
    hint: "Check LASTFM_API_KEY, the Last.fm username, and that recent listening is not hidden.",
    headers: { Accept: "application/json" },
  });
  if (!result.ok) {
    return result;
  }

  const body = await readJson<LastfmRecentTracksResponse>(result.response, "Last.fm");
  if (!body.ok) {
    return body;
  }
  // Some failures (unknown user, bad key) still answer 200 with an error code.
  if (body.data?.error) {
    return {
      ok: false,
      status: 502,
      message: `Last.fm error ${body.data.error}: ${body.data.message ?? "unknown"}.`,
    };
  }

  const { tracks, total } = parseRecentTracks(body.data ?? {}, limit);
  return {
    ok: true,
    total,
    tracks: await pixelateEach(tracks, "image", {
      width: PIXEL_GRID.thumb,
      height: PIXEL_GRID.thumb,
    }),
  };
}
