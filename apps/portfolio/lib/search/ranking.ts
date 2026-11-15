import {
  asksForRecencyTokens,
  GENERIC_WORK_TERMS,
  isWithinOneEdit,
  MIN_FUZZY_LENGTH,
  RECENCY_TERMS,
  termVariants,
} from "./terms";

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
  body?: string;
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
  titleFuzzy: 4,
  tagFuzzy: 3,
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

/**
 * Words that name no topic. Ask ranks the whole question, and "what is … about"
 * would otherwise count as a match on nearly every page. Spelled normalized.
 */
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "can",
  "did",
  "do",
  "does",
  "for",
  "from",
  "has",
  "have",
  "how",
  "in",
  "is",
  "it",
  "its",
  "me",
  "my",
  "of",
  "on",
  "or",
  "tell",
  "that",
  "the",
  "this",
  "to",
  "was",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "with",
  "you",
  "your",
  "about",
  "any",
  "show",
  "auf",
  "bitte",
  "das",
  "dem",
  "den",
  "der",
  "des",
  "die",
  "du",
  "ein",
  "eine",
  "einem",
  "einen",
  "einer",
  "es",
  "fur",
  "gibt",
  "hat",
  "ich",
  "im",
  "ist",
  "mal",
  "mir",
  "mit",
  "oder",
  "sind",
  "uber",
  "und",
  "von",
  "warum",
  "was",
  "welche",
  "wer",
  "wie",
  "wo",
  "zu",
]);

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

/**
 * The words a query is ranked on: tokenized, deduplicated, filler dropped. A
 * query of nothing but filler keeps it, so "the who" still finds something.
 * `/api/search` returns these so clients highlight what was actually matched.
 */
export function queryTerms(query: string): string[] {
  const tokens = [...new Set(tokenize(query))];
  if (asksForRecencyTokens(tokens)) {
    return tokens.filter(
      (token) =>
        !RECENCY_TERMS.has(token) && !STOP_WORDS.has(token) && !GENERIC_WORK_TERMS.has(token),
    );
  }
  const topical = tokens.filter((token) => !STOP_WORDS.has(token));
  return topical.length > 0 ? topical : tokens;
}

export function asksForRecency(query: string): boolean {
  return asksForRecencyTokens(tokenize(query));
}

/** True when `token` starts a word of normalized `text` (or is one, if short). */
export function matchesWord(text: string, token: string): boolean {
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

interface DocumentScore {
  score: number;
  /** How many query terms hit any field. */
  matched: number;
  hasFieldHit: boolean;
}

function scoreDocument(
  document: SearchDocument,
  query: string,
  tokens: string[],
  variantsByToken: string[][],
): DocumentScore {
  const title = normalize(document.title);
  const body = normalize(document.body ?? document.excerpt);
  const tags = tagVariants(document);
  const titleWords = title.split(" ");
  const tagWords = tags.flatMap((tag) => tag.split(" "));

  let score = 0;
  let matched = 0;
  let hasFieldHit = false;

  if (title === query) {
    score += WEIGHT.titleExact;
  } else if (title.startsWith(query)) {
    score += WEIGHT.titlePrefix;
  }

  for (const [index, token] of tokens.entries()) {
    const variants = variantsByToken[index];
    let hit = false;

    const titleVariant = variants.find((variant) => matchesWord(title, variant));
    if (titleVariant) {
      score += title.startsWith(titleVariant) ? WEIGHT.titlePrefix : WEIGHT.titleToken;
      hit = true;
      hasFieldHit = true;
    } else if (isTypoOf(token, titleWords)) {
      score += WEIGHT.titleFuzzy;
      hit = true;
      hasFieldHit = true;
    }

    if (variants.some((variant) => tags.includes(variant))) {
      score += WEIGHT.tagExact;
      hit = true;
      hasFieldHit = true;
    } else if (tags.some((tag) => variants.some((variant) => matchesWord(tag, variant)))) {
      score += WEIGHT.tagToken;
      hit = true;
      hasFieldHit = true;
    } else if (isTypoOf(token, tagWords)) {
      score += WEIGHT.tagFuzzy;
      hit = true;
      hasFieldHit = true;
    }

    if (variants.some((variant) => matchesWord(body, variant))) {
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

  return { score, matched, hasFieldHit };
}

function isTypoOf(token: string, words: string[]): boolean {
  if (token.length < MIN_FUZZY_LENGTH) {
    return false;
  }
  return words.some((word) => word.length >= MIN_FUZZY_LENGTH && isWithinOneEdit(token, word));
}

/**
 * Every query term has to match, as in Algolia's default. When no document
 * matches them all, the best-covered ones stand in, so a typo or a half-typed
 * last word narrows the list instead of emptying it — and a lone shared word
 * like `app` no longer pads a precise query with unrelated work.
 *
 * Ties break on recency, then title.
 */
export function rankDocuments(
  documents: SearchDocument[],
  query: string,
  limit = 8,
): SearchResult[] {
  const normalized = normalize(query);
  const tokens = queryTerms(query);
  const isRecency = asksForRecency(query);
  if (!normalized) {
    return [];
  }
  if (tokens.length === 0) {
    return isRecency ? newestWork(documents, limit) : [];
  }

  const variantsByToken = tokens.map(termVariants);
  const scored = documents
    .map((document) => ({
      document,
      ...scoreDocument(document, normalized, tokens, variantsByToken),
    }))
    .filter((entry) => entry.score > 0);
  const coverage = Math.max(0, ...scored.map((entry) => entry.matched));
  const covered = scored.filter((entry) => entry.matched === coverage);
  const kept =
    isRecency && covered.some((entry) => entry.hasFieldHit)
      ? covered.filter((entry) => entry.hasFieldHit)
      : covered;

  return kept
    .map(({ document, score }) => ({ ...document, score }))
    .sort((a, b) =>
      isRecency
        ? byDate(a, b) || b.score - a.score || a.title.localeCompare(b.title)
        : b.score - a.score || byDate(a, b) || a.title.localeCompare(b.title),
    )
    .slice(0, limit);
}

export function newestWork(documents: SearchDocument[], limit: number): SearchResult[] {
  return documents
    .filter((document) => document.kind === "work")
    .map((document) => ({ ...document, score: 1 }))
    .sort((a, b) => byDate(a, b) || a.title.localeCompare(b.title))
    .slice(0, limit);
}

function byDate(a: SearchDocument, b: SearchDocument): number {
  return (b.date ?? "").localeCompare(a.date ?? "");
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
