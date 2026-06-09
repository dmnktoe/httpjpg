// PSN has no public trophy API without an authenticated NPSSO token; the PSN
// Trophy Leaders per-member RSS feed is the authless source:
// https://psntrophyleaders.com/user/view/<username>/rss

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

const PSN_TIMEOUT_MS = 5000;
const DEFAULT_LIMIT = 4;

const FEED_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
} as const;

const DEFAULT_FEED_PROXY = "https://api.allorigins.win/raw?url={url}";

const BLOCK_STATUSES = new Set([403, 429, 503]);

type FeedFetch = { ok: true; xml: string } | { ok: false; status: number; message: string };

// PSN online IDs are 3–16 chars, start with a letter, then letters/digits/-/_.
// Validate the CMS value before it reaches the RSS URL.
const PSN_USERNAME = /^[A-Za-z][\w-]{2,15}$/;

export function isPsnUsername(value: unknown): value is string {
  return typeof value === "string" && PSN_USERNAME.test(value);
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

// Feed values like trophy names arrive entity-encoded (&amp;, &#039;).
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

// The feed labels the trophy tier as plain text inside a coloured <font> tag.
function readTrophyType(description: string): TrophyType | null {
  const match = description.match(/>(Bronze|Silver|Gold|Platinum)<\/font>/i);
  return match ? (match[1].toLowerCase() as TrophyType) : null;
}

function toIsoDate(pubDate: string | null): string | null {
  if (!pubDate) {
    return null;
  }
  const time = Date.parse(pubDate);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

// Only items with a recognisable trophy tier are kept; the feed is already
// ordered newest-first by earned date. readTag has decoded the <description>
// HTML, so the fields pulled out of it don't need decoding again.
export function parsePsnTrophyFeed(xml: string, limit = DEFAULT_LIMIT): PsnTrophy[] {
  if (limit <= 0) {
    return [];
  }
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const trophies: PsnTrophy[] = [];

  for (const item of items) {
    const html = readTag(item, "description");
    if (!html) {
      continue;
    }
    const type = readTrophyType(html);
    if (!type) {
      continue;
    }

    // "<username> | <Trophy Name>" — the name is everything after the first pipe.
    const title = readTag(item, "title") ?? "";
    const pipe = title.indexOf(" | ");

    trophies.push({
      name: pipe >= 0 ? title.slice(pipe + 3).trim() : title.trim(),
      game: html.match(/<strong><a[^>]*>([^<]+)<\/a><\/strong>/)?.[1]?.trim() ?? "",
      platform: html.match(/>(PS\d)<\/font>/)?.[1] ?? null,
      type,
      description: html.match(/color="#666">([^<]*)<\/font>/)?.[1]?.trim() || null,
      earnedAt: toIsoDate(readTag(item, "pubDate")),
      url: readTag(item, "link") ?? "https://psntrophyleaders.com",
      avatar:
        html.match(
          /<img[^>]+src="(https:\/\/static-resource\.np\.community\.playstation\.net\/avatar\/[^"]+)"/,
        )?.[1] ?? null,
    });
  }

  return trophies.slice(0, limit);
}

async function requestFeed(url: string): Promise<FeedFetch> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PSN_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: FEED_HEADERS,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { ok: false, status: 504, message: "PSN Trophy Leaders request timed out." };
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: `Status ${response.status}. Check the PSN username and that the profile is public.`,
    };
  }

  return { ok: true, xml: await response.text() };
}

export async function fetchPsnTrophies(
  username: string,
  limit = DEFAULT_LIMIT,
  proxy: string | null = DEFAULT_FEED_PROXY,
): Promise<PsnTrophyFetchResult> {
  const feedUrl = `https://psntrophyleaders.com/user/view/${username}/rss`;

  let result = await requestFeed(feedUrl);
  if (!result.ok && proxy && BLOCK_STATUSES.has(result.status)) {
    result = await requestFeed(proxy.replace("{url}", encodeURIComponent(feedUrl)));
  }

  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }

  return { ok: true, trophies: parsePsnTrophyFeed(result.xml, limit) };
}
