import type { PaletteLink } from "@/lib/queries/config";

/**
 * Idle palette rows when the query is empty, or the subset whose title /
 * excerpt / href match the typed query. Matching is substring + case-folding
 * so "git" hits GitHub without pulling in the full search ranker.
 */
export function filterPaletteLinks(links: readonly PaletteLink[], query: string): PaletteLink[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return [...links];
  }

  return links.filter((link) => {
    const haystack = `${link.title} ${link.excerpt ?? ""} ${link.href}`.toLowerCase();
    return haystack.includes(trimmed);
  });
}

/** Palette rows first, then search hits, dropping search duplicates of a link href. */
export function mergePaletteResults(
  links: readonly PaletteLink[],
  results: Array<{
    id: string;
    title: string;
    href: string;
    kind: "work" | "page" | "nav" | "social";
    excerpt?: string;
  }>,
): Array<{
  id: string;
  title: string;
  href: string;
  kind: "work" | "page" | "nav" | "social";
  excerpt?: string;
}> {
  const linkHrefs = new Set(links.map((link) => link.href));
  return [
    ...links.map((link) => ({
      id: link.id,
      title: link.title,
      href: link.href,
      kind: link.kind,
      excerpt: link.excerpt,
    })),
    ...results.filter((result) => !linkHrefs.has(result.href)),
  ];
}
