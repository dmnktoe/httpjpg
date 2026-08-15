import { CMS_OPTIONS } from "@httpjpg/storyblok-utils";
import { draftMode, headers } from "next/headers";

import { isInternalSlug } from "./page-theme";
import { getCachedStory } from "./queries/work";
import { STORYBLOK_EDITOR_HEADER } from "./storyblok-editor";
import { STORYBLOK_SLUGS } from "./storyblok-slugs";

/** RGB channels for the header scroll veil, stamped onto `<html>`. */
export const PAGE_VEIL_RGB_VAR = "--page-veil-rgb";

const CMS_COLORS = new Set<string>(CMS_OPTIONS.colors);

/**
 * Accepts a Storyblok `color-options` hex and returns space-separated RGB
 * channels for `rgb(… / α)`, or `null` when missing / outside the contract.
 */
export function resolveVeilTint(value: unknown): string | null {
  if (typeof value !== "string" || !CMS_COLORS.has(value)) {
    return null;
  }
  return hexToRgbChannels(value);
}

/** `#84CC16` → `"132 204 22"`. */
export function hexToRgbChannels(hex: string): string | null {
  const raw = hex.startsWith("#") ? hex.slice(1) : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) {
    return null;
  }
  return [
    parseInt(raw.slice(0, 2), 16),
    parseInt(raw.slice(2, 4), 16),
    parseInt(raw.slice(4, 6), 16),
  ].join(" ");
}

/**
 * Resolves the current request's work-page accent into veil RGB channels.
 * Non-work pages and editor chrome return `null` (theme black/white veil).
 */
export async function getPageVeilTint(): Promise<string | null> {
  const reqHeaders = await headers();
  if (reqHeaders.get(STORYBLOK_EDITOR_HEADER) === "1") {
    return null;
  }
  const pathname = reqHeaders.get("x-pathname") ?? "/";
  const trimmed = pathname.replace(/^\/+|\/+$/g, "");
  const slug = trimmed || STORYBLOK_SLUGS.HOME;
  if (isInternalSlug(slug)) {
    return null;
  }
  try {
    const { isEnabled } = await draftMode();
    const fetchDraft = isEnabled || process.env.NODE_ENV === "development";
    const story = await getCachedStory(slug, { draftMode: fetchDraft });
    if (story?.content?.component !== "work") {
      return null;
    }
    return resolveVeilTint(story.content?.accentColor);
  } catch {
    return null;
  }
}
