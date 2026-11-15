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

export function asksForRecencyTokens(tokens: string[]): boolean {
  return tokens.some((token) => RECENCY_TERMS.has(token));
}

export const MIN_FUZZY_LENGTH = 5;

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

export function singular(token: string): string | null {
  if (token.length >= 7 && token.endsWith("en")) {
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
