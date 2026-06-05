// Letterboxd has no public API; the per-member RSS feed is the supported
// source: https://letterboxd.com/<username>/rss/

export interface LetterboxdFilm {
  title: string;
  year: string | null;
  rating: number | null;
  rewatch: boolean;
  liked: boolean;
  watchedDate: string | null;
  url: string;
  poster: string | null;
}

export type LetterboxdFetchResult =
  | { ok: true; films: LetterboxdFilm[] }
  | { ok: false; status: number; message: string };

const LETTERBOXD_TIMEOUT_MS = 5000;
const DEFAULT_LIMIT = 4;

// Validate the CMS value before it reaches the RSS URL.
const LETTERBOXD_USERNAME = /^\w{1,30}$/;

export function isLetterboxdUsername(value: unknown): value is string {
  return typeof value === "string" && LETTERBOXD_USERNAME.test(value);
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

// Feed values like film titles arrive entity-encoded (&amp;, &#039;).
function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-fA-F]+|\w+);/g, (match, entity: string) => {
    if (entity[0] === "#") {
      const codePoint =
        entity[1].toLowerCase() === "x"
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
    }
    return entity in NAMED_ENTITIES ? NAMED_ENTITIES[entity] : match;
  });
}

function readTag(chunk: string, tag: string): string | null {
  const match = chunk.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!match) {
    return null;
  }
  const cdata = match[1].match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return decodeEntities((cdata ? cdata[1] : match[1]).trim());
}

// Only diary entries carry letterboxd:filmTitle; other feed items are skipped.
export function parseLetterboxdFeed(xml: string, limit = DEFAULT_LIMIT): LetterboxdFilm[] {
  if (limit <= 0) {
    return [];
  }
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const films: LetterboxdFilm[] = [];

  for (const item of items) {
    const title = readTag(item, "letterboxd:filmTitle");
    if (!title) {
      continue;
    }

    const ratingText = readTag(item, "letterboxd:memberRating");
    const rating = ratingText ? Number.parseFloat(ratingText) : null;
    const poster = readTag(item, "description")?.match(/<img[^>]+src="([^"]+)"/)?.[1] ?? null;

    films.push({
      title,
      year: readTag(item, "letterboxd:filmYear"),
      rating: rating !== null && !Number.isNaN(rating) ? rating : null,
      rewatch: readTag(item, "letterboxd:rewatch")?.toLowerCase() === "yes",
      liked: readTag(item, "letterboxd:memberLike")?.toLowerCase() === "yes",
      watchedDate: readTag(item, "letterboxd:watchedDate"),
      url: readTag(item, "link") ?? "https://letterboxd.com",
      poster,
    });
  }

  // The feed is ordered by log time (pubDate); reorder by watch date so the
  // most recently *watched* film comes first. Undated entries sort last.
  films.sort((a, b) => (b.watchedDate ?? "").localeCompare(a.watchedDate ?? ""));

  return films.slice(0, limit);
}

export async function fetchLetterboxdFilms(
  username: string,
  limit = DEFAULT_LIMIT,
): Promise<LetterboxdFetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LETTERBOXD_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`https://letterboxd.com/${username}/rss/`, {
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { ok: false, status: 504, message: "Letterboxd request timed out." };
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: `Status ${response.status}. Check the Letterboxd username and that the profile is public.`,
    };
  }

  const xml = await response.text();
  return { ok: true, films: parseLetterboxdFeed(xml, limit) };
}
