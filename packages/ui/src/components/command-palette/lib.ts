/**
 * Below this length a term only marks a whole word. Same rule the server ranks
 * by, so the marker never lights up a hit the ranking did not count.
 */
const MIN_PREFIX_LENGTH = 4;

/** Long enough to read why a row matched; the row clips the rest anyway. */
const MAX_SNIPPET_LENGTH = 240;

/** `[1]` or `[1, 3]`, as the site assistant cites its sources. */
const CITATION = /\[(\d+(?:\s*,\s*\d+)*)\]/g;
const CITATION_SPLIT = /(\[\d+(?:\s*,\s*\d+)*\])/;

export interface TextRange {
  start: number;
  end: number;
}

export interface AnswerSegment {
  text: string;
  isCitation: boolean;
}

/**
 * Where each term starts a word in `text`, overlaps merged, in order. Terms
 * arrive normalized from `/api/search` (lowercase, no diacritics), so the text
 * is folded the same way before matching.
 */
export function highlightRanges(text: string, terms: string[]): TextRange[] {
  if (!text || terms.length === 0) {
    return [];
  }
  const { folded, origin } = fold(text);
  const found: TextRange[] = [];

  for (const term of terms) {
    if (!term) {
      continue;
    }
    let from = folded.indexOf(term);
    while (from !== -1) {
      const end = from + term.length;
      const startsWord = from === 0 || !isWordChar(folded[from - 1]);
      const endsWord = end === folded.length || !isWordChar(folded[end]);
      if (startsWord && (term.length >= MIN_PREFIX_LENGTH || endsWord)) {
        found.push({ start: origin[from], end: origin[end - 1] + 1 });
      }
      from = folded.indexOf(term, from + 1);
    }
  }

  return merge(found);
}

/** Starts a long excerpt near its first match, so the row shows *why* it matched. */
export function snippetAround(text: string, terms: string[], lead = 32): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  const first = highlightRanges(collapsed, terms)[0];
  if (!first || first.start <= lead) {
    return collapsed.slice(0, MAX_SNIPPET_LENGTH);
  }
  const space = collapsed.indexOf(" ", first.start - lead);
  const start = space !== -1 && space < first.start ? space + 1 : first.start - lead;
  return `…${collapsed.slice(start, start + MAX_SNIPPET_LENGTH)}`;
}

/**
 * The 1-based source numbers an answer cites, ascending. The server sends every
 * document it retrieved; the ones the answer never cites were context only.
 */
export function citedSourceNumbers(answer: string, sourceCount: number): number[] {
  const cited = new Set<number>();
  for (const match of answer.matchAll(CITATION)) {
    for (const part of match[1].split(",")) {
      const number = Number.parseInt(part.trim(), 10);
      if (number >= 1 && number <= sourceCount) {
        cited.add(number);
      }
    }
  }
  return [...cited].sort((a, b) => a - b);
}

/** Prose and `[n]` citations in order, so citations can be set apart. */
export function splitCitations(answer: string): AnswerSegment[] {
  return answer
    .split(CITATION_SPLIT)
    .map((text, index) => ({ text, isCitation: index % 2 === 1 }))
    .filter((segment) => segment.text.length > 0);
}

/** Lowercased, diacritics stripped, with each folded char's index in the original. */
function fold(text: string): { folded: string; origin: number[] } {
  let folded = "";
  const origin: number[] = [];
  for (let index = 0; index < text.length; index += 1) {
    const piece = text[index]
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
    for (const char of piece) {
      folded += char;
      origin.push(index);
    }
  }
  return { folded, origin };
}

function isWordChar(char: string | undefined): boolean {
  return char !== undefined && /[a-z0-9]/.test(char);
}

function merge(ranges: TextRange[]): TextRange[] {
  const merged: TextRange[] = [];
  for (const range of [...ranges].sort((a, b) => a.start - b.start)) {
    const last = merged.at(-1);
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}
