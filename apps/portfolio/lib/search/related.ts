import type { SearchDocument } from "./ranking";

export interface RelatedDocument extends SearchDocument {
  score: number;
  sharedTags: string[];
}

/**
 * Inverse document frequency over the corpus. Two stories both tagged `web`
 * say nothing on a site where everything is web; two both tagged `glsl` say
 * a great deal.
 */
function tagWeights(documents: SearchDocument[]): Map<string, number> {
  const total = documents.length;
  const frequency = new Map<string, number>();

  for (const document of documents) {
    for (const tag of new Set(document.tagValues ?? [])) {
      frequency.set(tag, (frequency.get(tag) ?? 0) + 1);
    }
  }

  const weights = new Map<string, number>();
  for (const [tag, count] of frequency) {
    weights.set(tag, Math.log(1 + total / count));
  }
  return weights;
}

/**
 * Neighbours of `current`, scored by the rarity of the tags they share with
 * it. A story with no tags has no neighbours — padding the strip with recent
 * work would make it a second prev/next, which the page already carries.
 */
export function relatedDocuments(
  documents: SearchDocument[],
  current: SearchDocument,
  limit = 3,
): RelatedDocument[] {
  const currentTags = new Set(current.tagValues ?? []);
  if (currentTags.size === 0) {
    return [];
  }

  const weights = tagWeights(documents);

  return documents
    .filter(
      (document) =>
        document.kind === "work" && document.id !== current.id && document.href !== current.href,
    )
    .map((document) => {
      const sharedTags = (document.tagValues ?? [])
        .filter((tag) => currentTags.has(tag))
        .sort((a, b) => (weights.get(b) ?? 0) - (weights.get(a) ?? 0));
      const score = sharedTags.reduce((sum, tag) => sum + (weights.get(tag) ?? 0), 0);
      return { ...document, score, sharedTags };
    })
    .filter((document) => document.sharedTags.length > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.sharedTags.length - a.sharedTags.length ||
        (b.date ?? "").localeCompare(a.date ?? "") ||
        a.title.localeCompare(b.title),
    )
    .slice(0, limit);
}
