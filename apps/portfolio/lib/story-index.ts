import { env } from "@httpjpg/env";

const FRESH_MS = 5 * 60_000;
const RECHECK_MS = 30_000;
const PER_PAGE = 1000;
const MAX_PAGES = 10;
const TIMEOUT_MS = 2500;
const DEFAULT_ENDPOINT = "https://api.storyblok.com/v2";

interface StoryIndex {
  slugs: Set<string>;
  fetchedAt: number;
}

interface LinkEntry {
  slug?: string;
  is_folder?: boolean;
}

let index: StoryIndex | null = null;
let pending: Promise<StoryIndex | null> | null = null;

export async function isPublishedStory(slug: string, now = Date.now()): Promise<boolean | null> {
  let current = index;
  if (!current || now - current.fetchedAt > FRESH_MS) {
    current = (await refresh(now)) ?? current;
  }
  if (!current) {
    return null;
  }
  if (current.slugs.has(slug)) {
    return true;
  }
  if (now - current.fetchedAt > RECHECK_MS) {
    current = (await refresh(now)) ?? current;
    return current.slugs.has(slug);
  }
  return false;
}

export function resetStoryIndex(): void {
  index = null;
  pending = null;
}

function refresh(now: number): Promise<StoryIndex | null> {
  pending ??= readSlugs()
    .then((slugs) => {
      if (!slugs.size) {
        return null;
      }
      index = { slugs, fetchedAt: now };
      return index;
    })
    .catch(() => null)
    .finally(() => {
      pending = null;
    });
  return pending;
}

async function readSlugs(): Promise<Set<string>> {
  const base = (env.STORYBLOK_API_ENDPOINT ?? DEFAULT_ENDPOINT).replace(/\/$/, "");
  const slugs = new Set<string>();

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = new URL(`${base}/cdn/links`);
    url.searchParams.set("token", env.NEXT_PUBLIC_STORYBLOK_TOKEN);
    url.searchParams.set("version", "published");
    url.searchParams.set("paginated", "1");
    url.searchParams.set("per_page", String(PER_PAGE));
    url.searchParams.set("page", String(page));

    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`Storyblok links answered ${response.status}`);
    }
    const body = (await response.json()) as { links?: Record<string, LinkEntry> };
    const links = Object.values(body.links ?? {});
    for (const link of links) {
      if (link.slug && !link.is_folder) {
        slugs.add(link.slug.replace(/^\/+|\/+$/g, ""));
      }
    }
    if (links.length < PER_PAGE) {
      break;
    }
  }

  return slugs;
}
