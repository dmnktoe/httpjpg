export interface SearchMedia {
  id: string;
  kind: "image" | "video" | "audio";
  /** 200px wide; empty for a track without artwork. */
  thumb: string;
  /** Unprocessed asset, for consumers that cut their own crops. */
  source?: string;
  focus?: string;
  label: string;
}

export interface SearchFeatured {
  source: string;
  focus?: string;
}

export interface SearchDocument {
  id: string;
  href: string;
  title: string;
  kind: "work" | "page";
  /** Display labels (`TypeScript`). */
  tags: string[];
  /** Canonical vocabulary values (`typescript`). */
  tagValues?: string[];
  excerpt: string;
  date?: string;
  media?: SearchMedia[];
  /** First `content.images` entry, as in the nav hover preview. */
  featured?: SearchFeatured;
}

export interface SearchResult extends SearchDocument {
  score: number;
}

/** Field weights: a body hit alone must never outrank a title hit. */
const WEIGHT = {
  titleExact: 100,
  titlePrefix: 14,
  titleToken: 8,
  tagExact: 12,
  tagToken: 6,
  excerptToken: 2,
  allTokens: 5,
} as const;

const MIN_TOKEN_LENGTH = 2;

/**
 * Below this length a token only matches a whole word. As a prefix or
 * substring, `app` pulls in every "happened" and "appearance", and `id` every
 * "provided", so a precise title query came back padded with unrelated work.
 */
const MIN_PREFIX_LENGTH = 4;

/** "Müller's" → "mullers": lowercase, no diacritics, no punctuation. */
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

/** True when `token` starts a word of normalized `text` (or is one, if short). */
function matchesWord(text: string, token: string): boolean {
  const padded = ` ${text} `;
  return token.length >= MIN_PREFIX_LENGTH
    ? padded.includes(` ${token}`)
    : padded.includes(` ${token} `);
}

/** Every tag spelling plus a space-free variant, so `nextjs` finds `Next.js`. */
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

    if (matchesWord(title, token)) {
      score += title.startsWith(token) ? WEIGHT.titlePrefix : WEIGHT.titleToken;
      hit = true;
    }
    if (tags.includes(token)) {
      score += WEIGHT.tagExact;
      hit = true;
    } else if (tags.some((tag) => matchesWord(tag, token))) {
      score += WEIGHT.tagToken;
      hit = true;
    }
    if (matchesWord(excerpt, token)) {
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

/** Ties break on recency, then title. */
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

/** Type-ahead from titles and tags; never a model call. */
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
