import { draftMode, headers } from "next/headers";

import { getCachedStory } from "./queries/work";
import { STORYBLOK_SLUGS } from "./storyblok-slugs";

export type PageTheme = "light" | "dark";

const INTERNAL_PREFIXES = ["__nextjs", "_next", ".well-known"];

export function isInternalSlug(slug: string): boolean {
  if (INTERNAL_PREFIXES.some((p) => slug.startsWith(p))) {
    return true;
  }
  return slug.includes("/.well-known/");
}

/** Light by default; only Storyblok-resolved pages with `content.isDark` flip to dark. */
export async function getPageTheme(): Promise<PageTheme> {
  const reqHeaders = await headers();
  if (reqHeaders.get("x-storyblok-editor") === "1") {
    return "light";
  }
  const pathname = reqHeaders.get("x-pathname") ?? "/";
  const trimmed = pathname.replace(/^\/+|\/+$/g, "");
  const slug = trimmed || STORYBLOK_SLUGS.HOME;
  if (isInternalSlug(slug)) {
    return "light";
  }
  try {
    const { isEnabled } = await draftMode();
    const fetchDraft = isEnabled || process.env.NODE_ENV === "development";
    const story = await getCachedStory(slug, { draftMode: fetchDraft });
    return story?.content?.isDark ? "dark" : "light";
  } catch {
    return "light";
  }
}
