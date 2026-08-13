import type { WorkCardProps } from "../work-card/work-card";

/**
 * Every tag the given works actually carry, most-used first so the filters
 * that narrow the list meaningfully sit at the front. Ties break
 * alphabetically, which keeps the order stable between server and client.
 *
 * Labels are the key rather than the underlying vocabulary values: labels are
 * unique across the catalog, and it saves threading a second array through the
 * card just to filter on it.
 */
export function collectWorkTags(works: WorkCardProps[]): string[] {
  const counts = new Map<string, number>();

  for (const work of works) {
    for (const tag of new Set(work.tags ?? [])) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort(([tagA, countA], [tagB, countB]) => countB - countA || tagA.localeCompare(tagB))
    .map(([tag]) => tag);
}

export function filterWorksByTag(works: WorkCardProps[], tag: string | null): WorkCardProps[] {
  if (!tag) {
    return works;
  }
  return works.filter((work) => work.tags?.includes(tag));
}
