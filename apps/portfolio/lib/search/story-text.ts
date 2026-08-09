import { extractPlainText } from "@httpjpg/storyblok-utils";

/**
 * Content keys worth indexing. An allowlist rather than "every string": a
 * Storyblok blok is mostly plumbing (uuids, colors, spacing tokens, asset
 * filenames), and indexing that noise makes every query match everything.
 */
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
]);

/** Bloks nest deeply; this bounds the walk so a cyclic payload cannot hang a build. */
const MAX_DEPTH = 8;

interface RichTextDoc {
  type: "doc";
  content?: unknown[];
}

function isRichTextDoc(value: unknown): value is RichTextDoc {
  return typeof value === "object" && value !== null && (value as { type?: string }).type === "doc";
}

/**
 * Flatten a Storyblok story's content into a single searchable string.
 *
 * Walks nested bloks and rich-text documents, collecting only allowlisted text
 * fields, then collapses whitespace so scoring sees consistent tokens.
 */
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
      const text = extractPlainText(node as { content?: [] });
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
