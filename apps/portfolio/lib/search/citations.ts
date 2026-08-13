const CITATION = /\[(\d+(?:\s*,\s*\d+)*)\]/;

/**
 * The 1-based index of the first source an answer cites, or null. Reading the
 * answer is what keeps the palette's "go to" offer honest: the model can only
 * point at a source it was already given, so there is no second model call and
 * no way to invent a link.
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
