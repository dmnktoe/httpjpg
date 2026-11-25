import { env } from "@httpjpg/env";
import { validateStoryblokPreviewToken } from "@httpjpg/storyblok-utils";

export type PageSearchParams = Record<string, string | string[] | undefined>;

const TOKEN_KEYS = [
  "_storyblok_tk[space_id]",
  "_storyblok_tk[timestamp]",
  "_storyblok_tk[token]",
] as const;

/**
 * Whether a page request may read drafts as the Visual Editor. `_storyblok` and
 * `_draft` are only markers anyone can type: they count when draft mode is on,
 * when Storyblok signed the request, or in development.
 */
export async function isVisualEditorRequest(
  search: PageSearchParams,
  isDraftMode: boolean,
): Promise<boolean> {
  if (!search._storyblok && !search._draft) {
    return false;
  }
  if (isDraftMode || process.env.NODE_ENV === "development") {
    return true;
  }
  return hasSignedStoryblokToken(search);
}

export async function hasSignedStoryblokToken(search: PageSearchParams): Promise<boolean> {
  const params = new URLSearchParams();
  for (const key of TOKEN_KEYS) {
    const value = search[key];
    if (typeof value === "string") {
      params.set(key, value);
    }
  }
  return validateStoryblokPreviewToken(params, env.STORYBLOK_PREVIEW_TOKEN);
}
