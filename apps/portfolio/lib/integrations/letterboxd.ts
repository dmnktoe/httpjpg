import { decodeEntities } from "./html";
import { fetchWithTimeout } from "./http";

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

const DEFAULT_LIMIT = 4;

const LETTERBOXD_USERNAME = /^\w{1,30}$/;

export function isLetterboxdUsername(value: unknown): value is string {
  return typeof value === "string" && LETTERBOXD_USERNAME.test(value);
}

function readTag(chunk: string, tag: string): string | null {
  const match = chunk.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!match) {
    return null;
  }
  const cdata = match[1].match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return decodeEntities((cdata ? cdata[1] : match[1]).trim());
}

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

  films.sort((a, b) => (b.watchedDate ?? "").localeCompare(a.watchedDate ?? ""));

  return films.slice(0, limit);
}

export async function fetchLetterboxdFilms(
  username: string,
  limit = DEFAULT_LIMIT,
): Promise<LetterboxdFetchResult> {
  const result = await fetchWithTimeout(`https://letterboxd.com/${username}/rss/`, {
    label: "Letterboxd",
    hint: "Check the Letterboxd username and that the profile is public.",
  });
  if (!result.ok) {
    return result;
  }

  const xml = await result.response.text();
  return { ok: true, films: parseLetterboxdFeed(xml, limit) };
}
