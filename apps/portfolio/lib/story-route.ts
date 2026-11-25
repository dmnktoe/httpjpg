import { splitLocaleSlug } from "./locale";

/**
 * Page routes with their own `page.tsx`. Every other page path is a story, drawn
 * by the catch-all. `story-route.test.ts` fails when a route is added here or
 * under `app/` without the other.
 */
export const APP_PAGE_ROUTES = ["feed", "cookie-policy"] as const;

/** Paths that are never a story; the proxy leaves them alone. */
const RESERVED_PREFIXES = ["api", "_next", "__nextjs", ".well-known"] as const;

/**
 * The Storyblok slug a page path asks for, or `null` when the path is not a
 * story page: the root, a route of its own, an API or framework path.
 */
export function storySlugForPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const [first] = segments;
  if (!first) {
    return null;
  }
  if ((RESERVED_PREFIXES as readonly string[]).includes(first)) {
    return null;
  }
  if (segments.length === 1 && (APP_PAGE_ROUTES as readonly string[]).includes(first)) {
    return null;
  }
  let decoded: string[];
  try {
    decoded = segments.map((segment) => decodeURIComponent(segment));
  } catch {
    return null;
  }
  return splitLocaleSlug(decoded).slug || null;
}
