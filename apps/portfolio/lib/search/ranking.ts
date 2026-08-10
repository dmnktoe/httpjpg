/** A thumbnail a story shows, surfaced in the palette's media strip. */
export interface SearchMedia {
  id: string;
  kind: "image" | "video" | "audio";
  /** Thumbnail URL. Empty for a track whose artwork the editor left blank. */
  thumb: string;
  label: string;
}

export interface SearchDocument {
  id: string;
  /** Site-relative href, e.g. `/work/some-project`. */
  href: string;
  title: string;
  kind: "work" | "page";
  /** Display labels — curated work tags first, then loose story tags. */
  tags: string[];
  /**
   * Canonical values from the curated work-tag vocabulary. Related work
   * compares these, never the labels, so a renamed label never splits a tag
   * in two.
   *
   * Optional because the index is persisted by `unstable_cache`: for up to an
   * hour after a deploy, entries written by the previous build are still
   * served, and those have no `tagValues` at all.
   */
  tagValues?: string[];
  excerpt: string;
  date?: string;
  media?: SearchMedia[];
}

export interface SearchResult extends SearchDocument {
  score: number;
}

/** Field weights: a body hit alone must never outrank a title hit. */
const WEIGHT = {
  titleExact: 100,
  titlePrefix: 14,
  titleToken: 8,
  /** A whole-tag hit — "swift" against the SwiftUI tag, not a substring of it. */
  tagExact: 12,
  tagToken: 6,
  excerptToken: 2,
  allTokens: 5,
} as const;

const MIN_TOKEN_LENGTH = 2;

/** Lowercase, strip diacritics, and drop punctuation so "Müller's" matches "muller". */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(value: string): string[] {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length >= MIN_TOKEN_LENGTH);
}

/**
 * Every spelling of a tag a visitor might type. "Next.js" normalizes to
 * "next js", but nobody types the space — so the collapsed form is a match
 * candidate too, and so is the stored value for tags whose label diverges
 * from it.
 */
function tagVariants(document: SearchDocument): string[] {
  const variants = new Set<string>();
  for (const tag of [...document.tags, ...(document.tagValues ?? [])]) {
    const normalized = normalize(tag);
    if (!normalized) {
      continue;
    }
    variants.add(normalized);
    variants.add(normalized.replace(/\s/g, ""));
  }
  return [...variants];
}

function scoreDocument(document: SearchDocument, query: string, tokens: string[]): number {
  const title = normalize(document.title);
  const excerpt = normalize(document.excerpt);
  const tags = tagVariants(document);

  let score = 0;
  let matched = 0;

  if (title === query) {
    score += WEIGHT.titleExact;
  } else if (title.startsWith(query)) {
    score += WEIGHT.titlePrefix;
  }

  for (const token of tokens) {
    let hit = false;

    if (title.includes(token)) {
      score += title.startsWith(token) ? WEIGHT.titlePrefix : WEIGHT.titleToken;
      hit = true;
    }
    if (tags.includes(token)) {
      score += WEIGHT.tagExact;
      hit = true;
    } else if (tags.some((tag) => tag.includes(token))) {
      score += WEIGHT.tagToken;
      hit = true;
    }
    if (excerpt.includes(token)) {
      score += WEIGHT.excerptToken;
      hit = true;
    }

    if (hit) {
      matched += 1;
    }
  }

  if (tokens.length > 1 && matched === tokens.length) {
    score += WEIGHT.allTokens;
  }

  return score;
}

/** Rank documents by relevance. Ties break on recency, then title, for stability. */
export function rankDocuments(
  documents: SearchDocument[],
  query: string,
  limit = 8,
): SearchResult[] {
  const normalized = normalize(query);
  const tokens = tokenize(query);
  if (!normalized || tokens.length === 0) {
    return [];
  }

  return documents
    .map((document) => ({ ...document, score: scoreDocument(document, normalized, tokens) }))
    .filter((result) => result.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.date ?? "").localeCompare(a.date ?? "") ||
        a.title.localeCompare(b.title),
    )
    .slice(0, limit);
}

/** Type-ahead completions from titles and tags. Index-only, never a model call. */
export function suggestCompletions(
  documents: SearchDocument[],
  query: string,
  limit = 5,
): string[] {
  const normalized = normalize(query);
  if (!normalized) {
    return [];
  }

  const candidates = new Map<string, number>();

  const consider = (phrase: string, weight: number): void => {
    const value = phrase.trim();
    if (!value) {
      return;
    }
    const target = normalize(value);
    if (!target.includes(normalized) || target === normalized) {
      return;
    }
    const rank = weight + (target.startsWith(normalized) ? 10 : 0);
    const key = value.toLowerCase();
    if (rank > (candidates.get(key) ?? -1)) {
      candidates.set(key, rank);
    }
  };

  for (const document of documents) {
    consider(document.title, 5);
    for (const tag of document.tags) {
      consider(tag, 3);
    }
  }

  const authored = new Map<string, string>();
  for (const document of documents) {
    for (const phrase of [document.title, ...document.tags]) {
      const key = phrase.trim().toLowerCase();
      if (key && !authored.has(key)) {
        authored.set(key, phrase.trim());
      }
    }
  }

  return [...candidates.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key]) => authored.get(key) ?? key);
}
