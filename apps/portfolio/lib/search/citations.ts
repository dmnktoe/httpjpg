const CITATION = /\[(\d+(?:\s*,\s*\d+)*)\]/;

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
