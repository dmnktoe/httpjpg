/**
 * Parse the Storyblok `_editable` comment injected on draft / Visual Editor
 * payloads. Shape: `<!--#storyblok#{ "name", "space", "uid", "id" }-->`.
 */
export interface StoryblokEditableMeta {
  name?: string;
  space: string;
  uid?: string;
  id: string;
}

export function parseStoryblokEditable(raw?: string): StoryblokEditableMeta | null {
  if (!raw) {
    return null;
  }
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return null;
  }
  try {
    const data = JSON.parse(raw.slice(start, end + 1)) as {
      name?: string;
      space?: string | number;
      uid?: string;
      id?: string | number;
    };
    if (data.space == null || data.id == null) {
      return null;
    }
    return {
      name: data.name,
      space: String(data.space),
      uid: data.uid,
      id: String(data.id),
    };
  } catch {
    return null;
  }
}

/** Visual Editor deep-link for a story. `id` is the numeric story id. */
export function storyblokEditorHref(spaceId: string, storyId: string): string {
  return `https://app.storyblok.com/#/me/spaces/${spaceId}/stories/0/0/${storyId}`;
}

export function storyblokEditorHrefFromEditable(raw?: string): string | null {
  const meta = parseStoryblokEditable(raw);
  if (!meta) {
    return null;
  }
  return storyblokEditorHref(meta.space, meta.id);
}
