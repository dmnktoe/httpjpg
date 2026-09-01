import { draftMode, headers } from "next/headers";

import { splitLocaleSlug } from "./locale";
import { getCachedStory } from "./queries/work";
import { STORYBLOK_EDITOR_HEADER } from "./storyblok-editor";
import { STORYBLOK_SLUGS } from "./storyblok-slugs";

export type PageTheme = "light" | "dark";

const INTERNAL_PREFIXES = ["__nextjs", "_next", ".well-known", "api/"];

export function isInternalSlug(slug: string): boolean {
  if (INTERNAL_PREFIXES.some((p) => slug.startsWith(p))) {
    return true;
  }
  return slug.includes("/.well-known/");
}

interface PageStoryContent {
  isDark?: boolean;
  component?: string;
  accentColor?: unknown;
}

/** Light by default; only Storyblok-resolved pages with `content.isDark` flip to dark. */
export async function getPageTheme(): Promise<PageTheme> {
  try {
    const story = await loadCurrentStory();
    return story?.content?.isDark ? "dark" : "light";
  } catch {
    return "light";
  }
}

/** Work page Project Accent Color, or `null` on every other surface. */
export async function getPageAccent(): Promise<string | null> {
  try {
    const story = await loadCurrentStory();
    if (story?.content?.component !== "work") {
      return null;
    }
    const raw = story.content.accentColor;
    return typeof raw === "string" && raw.trim() ? raw : null;
  } catch {
    return null;
  }
}

async function loadCurrentStory(): Promise<{ content?: PageStoryContent } | null> {
  const reqHeaders = await headers();
  if (reqHeaders.get(STORYBLOK_EDITOR_HEADER) === "1") {
    return null;
  }
  const pathname = reqHeaders.get("x-pathname") ?? "/";
  const trimmed = pathname.replace(/^\/+|\/+$/g, "");
  const { slug: localeSlug } = splitLocaleSlug(trimmed ? trimmed.split("/") : []);
  const slug = localeSlug || STORYBLOK_SLUGS.HOME;
  if (isInternalSlug(slug)) {
    return null;
  }
  const { isEnabled } = await draftMode();
  const fetchDraft = isEnabled || process.env.NODE_ENV === "development";
  return getCachedStory(slug, { draftMode: fetchDraft });
}
