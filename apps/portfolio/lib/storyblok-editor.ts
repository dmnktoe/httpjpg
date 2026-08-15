import type { NextRequest } from "next/server";

export const STORYBLOK_EDITOR_HEADER = "x-storyblok-editor";

/** True when the URL carries any Storyblok Visual Editor query param. */
export function hasStoryblokEditorParams(searchParams: URLSearchParams): boolean {
  for (const key of searchParams.keys()) {
    if (key === "_storyblok" || key.startsWith("_storyblok_")) {
      return true;
    }
  }
  return false;
}

/**
 * True for a request that should be treated as the Storyblok Visual Editor.
 *
 * Query params are the normal signal, but story changes inside the editor often
 * reload the iframe without `_storyblok*` still on the URL. CSP only allows
 * framing by Storyblok, so an iframe navigation is the editor too.
 */
export function isStoryblokEditorRequest(request: NextRequest): boolean {
  if (hasStoryblokEditorParams(request.nextUrl.searchParams)) {
    return true;
  }
  return request.headers.get("sec-fetch-dest") === "iframe";
}
