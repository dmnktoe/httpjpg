import { matchesWord, normalize } from "./ranking";
import { termVariants } from "./terms";

const LEAD_LENGTH = 240;

const GAP = " … ";

export function selectPassages(text: string, terms: string[], budget: number): string {
  if (text.length <= budget) {
    return text;
  }

  const sentences = splitSentences(text);
  const picked = new Set<number>();
  const leadLength = Math.min(LEAD_LENGTH, Math.floor(budget / 3));
  let used = 0;

  for (let index = 0; index < sentences.length; index += 1) {
    const length = sentences[index].length;
    if (length > budget || (picked.size > 0 && used + length > leadLength)) {
      break;
    }
    picked.add(index);
    used += length + 1;
  }

  const variants = terms.map(termVariants);
  const ranked = sentences
    .map((sentence, index) => ({ index, hits: countHits(normalize(sentence), variants) }))
    .filter((entry) => entry.hits > 0 && !picked.has(entry.index))
    .sort((a, b) => b.hits - a.hits || a.index - b.index);

  for (const { index } of ranked) {
    const cost = sentences[index].length + GAP.length;
    if (used + cost > budget) {
      continue;
    }
    picked.add(index);
    used += cost;
  }

  for (let index = 0; index < sentences.length; index += 1) {
    if (picked.has(index)) {
      continue;
    }
    const cost = sentences[index].length + GAP.length;
    if (used + cost > budget) {
      break;
    }
    picked.add(index);
    used += cost;
  }

  if (picked.size === 0) {
    return `${text.slice(0, budget).trimEnd()}…`;
  }

  return joinInOrder(sentences, picked);
}

function countHits(sentence: string, variants: string[][]): number {
  return variants.filter((spellings) => spellings.some((term) => matchesWord(sentence, term)))
    .length;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function joinInOrder(sentences: string[], picked: Set<number>): string {
  const order = [...picked].sort((a, b) => a - b);
  let result = "";
  let previous = -1;
  for (const index of order) {
    if (result) {
      result += index === previous + 1 ? " " : GAP;
    }
    result += sentences[index];
    previous = index;
  }
  return result;
}
