import { storyblokEditorHrefFromEditable } from "@httpjpg/storyblok-utils";

/** Visual Editor deep-link from a draft `_editable` comment. Not a work-page URL. */
export function editHrefFromEditable(editable?: unknown): string | null {
  return typeof editable === "string" ? storyblokEditorHrefFromEditable(editable) : null;
}
