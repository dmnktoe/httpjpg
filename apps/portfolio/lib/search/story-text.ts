import { extractPlainText, type StoryblokRichText } from "@httpjpg/storyblok-utils";

/** Indexable text keys. An allowlist keeps blok plumbing out of the index. */
const TEXT_KEYS = new Set([
  "title",
  "headline",
  "subtitle",
  "text",
  "label",
  "caption",
  "alt",
  "quote",
  "value",
  // Track credits: a music player's title already lands via `title`, and
  // searching a page by the artist on it should work the same way.
  "artist",
]);

/** Bounds the walk so a cyclic payload cannot hang a build. */
const MAX_DEPTH = 8;

function isRichTextDoc(value: unknown): value is StoryblokRichText {
  return typeof value === "object" && value !== null && (value as { type?: string }).type === "doc";
}

/** Flatten a story's content into one searchable string. */
export function collectStoryText(content: unknown, maxLength = 1200): string {
  const parts: string[] = [];

  const walk = (node: unknown, depth: number): void => {
    if (depth > MAX_DEPTH || node === null || node === undefined) {
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) {
        walk(item, depth + 1);
      }
      return;
    }
    if (isRichTextDoc(node)) {
      const text = extractPlainText(node);
      if (text) {
        parts.push(text);
      }
      return;
    }
    if (typeof node !== "object") {
      return;
    }
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (typeof value === "string") {
        if (TEXT_KEYS.has(key) && value.trim()) {
          parts.push(value.trim());
        }
        continue;
      }
      walk(value, depth + 1);
    }
  };

  walk(content, 0);

  const joined = parts.join(" ").replace(/\s+/g, " ").trim();
  return joined.length > maxLength ? `${joined.slice(0, maxLength).trimEnd()}…` : joined;
}
