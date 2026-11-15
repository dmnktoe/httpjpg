/**
 * Query-side vocabulary for the lexical ranker: spellings a term also matches
 * (synonyms across German and English, plural endings) and the words that ask
 * for recency rather than name a topic. All values are spelled normalized.
 */

/** Words that are equivalent in a query, both ways round. */
const SYNONYM_GROUPS: readonly (readonly string[])[] = [
  ["project", "projekt"],
  ["work", "arbeit"],
  ["photo", "foto", "photography", "fotografie"],
  ["music", "musik"],
  ["video", "film"],
  ["website", "webseite", "site"],
  ["poster", "plakat"],
  ["sound", "audio", "klang"],
  ["exhibition", "ausstellung"],
  ["design", "gestaltung"],
  ["research", "forschung"],
  ["client", "kunde", "auftrag"],
];

const SYNONYMS = buildSynonyms(SYNONYM_GROUPS);

/**
 * Words asking for the newest work. Ranked as filler, so "latest project" is
 * not narrowed to pages that happen to contain the word "latest". "new" is
 * left out: it starts too many titles.
 */
export const RECENCY_TERMS = new Set([
  "latest",
  "newest",
  "recent",
  "recently",
  "current",
  "neueste",
  "neuester",
  "neuestes",
  "neuesten",
  "neuste",
  "neuster",
  "neustes",
  "aktuell",
  "aktuelle",
  "aktueller",
  "aktuelles",
  "aktuellste",
  "letzte",
  "letzter",
  "letztes",
  "zuletzt",
]);

/**
 * Words that name a work item in general. Beside a recency word they add
 * nothing — "latest project" means the newest work, not work mentioning
 * "project" — so they are dropped there, and only there.
 */
export const GENERIC_WORK_TERMS = new Set([
  "project",
  "projects",
  "projekt",
  "projekte",
  "work",
  "works",
  "arbeit",
  "arbeiten",
  "thing",
  "things",
  "piece",
  "pieces",
]);

/** True when any token asks for the newest work. */
export function asksForRecencyTokens(tokens: string[]): boolean {
  return tokens.some((token) => RECENCY_TERMS.has(token));
}

/** Shortest token a typo is forgiven in. Below it, one edit is a different word. */
export const MIN_FUZZY_LENGTH = 5;

/** The token, its singular stem, and every synonym of either. */
export function termVariants(token: string): string[] {
  const variants = new Set([token]);
  const stem = singular(token);
  if (stem) {
    variants.add(stem);
  }
  for (const base of [...variants]) {
    for (const synonym of SYNONYMS.get(base) ?? []) {
      variants.add(synonym);
    }
  }
  return [...variants];
}

/**
 * A light plural strip, English and German. Prefix matching already finds
 * "projects" from "project"; this covers the other direction, so "apps" finds
 * "app" and "arbeiten" finds "arbeit".
 */
export function singular(token: string): string | null {
  if (token.length >= 6 && token.endsWith("en")) {
    return token.slice(0, -2);
  }
  if (token.length >= 6 && token.endsWith("e")) {
    return token.slice(0, -1);
  }
  if (token.length >= 4 && token.endsWith("s") && !/(ss|us|is)$/.test(token)) {
    return token.slice(0, -1);
  }
  return null;
}

/**
 * True when `a` becomes `b` with at most one insertion, deletion,
 * substitution, or swap of neighbouring letters (optimal string alignment).
 */
export function isWithinOneEdit(a: string, b: string): boolean {
  if (a === b) {
    return true;
  }
  if (Math.abs(a.length - b.length) > 1) {
    return false;
  }

  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) {
    start += 1;
  }
  const restA = a.slice(start);
  const restB = b.slice(start);

  if (restA.length === restB.length) {
    if (restA.slice(1) === restB.slice(1)) {
      return true;
    }
    return restA.length >= 2 && restA[0] === restB[1] && restA[1] === restB[0]
      ? restA.slice(2) === restB.slice(2)
      : false;
  }
  return restA.length > restB.length ? restA.slice(1) === restB : restA === restB.slice(1);
}

function buildSynonyms(groups: readonly (readonly string[])[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const group of groups) {
    for (const word of group) {
      map.set(
        word,
        group.filter((other) => other !== word),
      );
    }
  }
  return map;
}
