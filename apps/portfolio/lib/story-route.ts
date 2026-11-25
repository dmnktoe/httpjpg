import { splitLocaleSlug } from "./locale";

export const APP_PAGE_ROUTES = ["feed", "cookie-policy"] as const;

const RESERVED_PREFIXES = ["api", "_next", "__nextjs", ".well-known"] as const;

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
