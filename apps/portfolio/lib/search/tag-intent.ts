import { type WorkTag, WORK_TAGS } from "@httpjpg/storyblok-utils";

import { normalize } from "./ranking";

/** Site-relative path of the CMS page that hosts the main work list. */
export const WORK_LIST_PATH = "/work";

/**
 * Verbs / nouns that signal "show me a filtered list" rather than "tell me
 * about a single project". Kept loose on purpose — "TypeScript projects" and
 * "show me React" both count.
 */
const BROWSE_PATTERN =
  /\b(show|list|find|filter|browse|projects?|works?|tagged|alles|zeige|projekte?|arbeiten)\b/i;

export interface TagBrowseIntent {
  tag: WorkTag;
  href: string;
  title: string;
}

/** Build the deep-link a work list reads via `?tag=`. Labels, not values. */
export function workTagFilterHref(tag: WorkTag, listPath = WORK_LIST_PATH): string {
  const params = new URLSearchParams({ tag: tag.label });
  return `${listPath}?${params.toString()}`;
}

/**
 * Longest-label / longest-value first so "Next.js" wins over a hypothetical
 * shorter neighbour, and hyphenated values still match typed spaces.
 */
function catalogBySpecificity(): WorkTag[] {
  return [...WORK_TAGS].sort(
    (a, b) =>
      Math.max(b.label.length, b.value.length) - Math.max(a.label.length, a.value.length) ||
      a.label.localeCompare(b.label),
  );
}

export function matchWorkTag(question: string): WorkTag | undefined {
  const normalized = normalize(question);
  if (!normalized) {
    return undefined;
  }

  for (const tag of catalogBySpecificity()) {
    const label = normalize(tag.label);
    const value = normalize(tag.value.replace(/-/g, " "));
    if (label && (normalized === label || normalized.includes(label))) {
      return tag;
    }
    if (value && (normalized === value || normalized.includes(value))) {
      return tag;
    }
  }

  return undefined;
}

/**
 * True when the question is basically just the tag (plus filler like "projects"),
 * or pairs a catalog tag with an explicit browse verb.
 */
export function resolveTagBrowseIntent(question: string): TagBrowseIntent | null {
  const tag = matchWorkTag(question);
  if (!tag) {
    return null;
  }

  const normalized = normalize(question);
  const label = normalize(tag.label);
  const value = normalize(tag.value.replace(/-/g, " "));
  const withoutTag = normalized.replace(label, " ").replace(value, " ").replace(/\s+/g, " ").trim();

  const isBrowse = BROWSE_PATTERN.test(question) || withoutTag.length === 0;
  if (!isBrowse) {
    return null;
  }

  return {
    tag,
    href: workTagFilterHref(tag),
    title: `${tag.label} work`,
  };
}
