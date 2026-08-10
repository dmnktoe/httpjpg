/**
 * The answer cites its sources as bracketed numbers — `[1]`, `[1][3]`,
 * sometimes `[1, 3]`. Reading the first one back out tells us which source the
 * model actually leant on, which is the page a visitor most likely wants next.
 *
 * Deriving the destination this way rather than asking for it means no second
 * model call and no room to invent a link: the number can only resolve to a
 * source we already retrieved.
 */
const CITATION = /\[(\d+(?:\s*,\s*\d+)*)\]/;

/**
 * 1-based index of the first cited source, or null when the answer cites
 * nothing or cites a number outside the range we handed it.
 */
export function firstCitedSource(text: string, sourceCount: number): number | null {
  if (sourceCount <= 0) {
    return null;
  }

  const match = text.match(CITATION);
  if (!match) {
    return null;
  }

  const first = Number.parseInt(match[1].split(",")[0].trim(), 10);
  if (!Number.isInteger(first) || first < 1 || first > sourceCount) {
    return null;
  }
  return first;
}
