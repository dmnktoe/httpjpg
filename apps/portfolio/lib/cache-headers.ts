export function widgetCacheHeaders(isDraft: boolean, maxAge: number): Record<string, string> {
  return {
    "Cache-Control": isDraft
      ? "private, no-store"
      : `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
  };
}
