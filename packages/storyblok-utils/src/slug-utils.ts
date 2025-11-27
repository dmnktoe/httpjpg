/**
 * Check if slug should be excluded from routing
 */
export function isSlugExcludedFromRouting(slug: string): boolean {
  // Exclude config folders, components, etc.
  const excludedPatterns = ["_config", "_components", "_layouts"];
  return excludedPatterns.some((pattern) => slug.includes(pattern));
}
