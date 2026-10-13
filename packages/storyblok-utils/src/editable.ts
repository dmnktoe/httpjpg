const NUMERIC_ID = /^\d+$/;

/**
 * Visual Editor deep-link for the story behind a draft blok.
 *
 * Storyblok adds `_editable` only to draft payloads:
 * `<!--#storyblok#{"name":"page","space":"123","uid":"…","id":"456"}-->`, where
 * `id` is the story id. Published content, or a comment that does not parse, → null.
 */
export function storyblokEditHref(editable: unknown): string | null {
  if (typeof editable !== "string") {
    return null;
  }
  const start = editable.indexOf("{");
  const end = editable.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return null;
  }
  try {
    const { space, id } = JSON.parse(editable.slice(start, end + 1)) as {
      space?: unknown;
      id?: unknown;
    };
    const spaceId = String(space ?? "");
    const storyId = String(id ?? "");
    if (!NUMERIC_ID.test(spaceId) || !NUMERIC_ID.test(storyId)) {
      return null;
    }
    return `https://app.storyblok.com/#/me/spaces/${spaceId}/stories/0/0/${storyId}`;
  } catch {
    return null;
  }
}
