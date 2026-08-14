import type { StoryblokRichTextNode } from "./types";

/**
 * Walk a Storyblok rich-text document and return the concatenated text,
 * optionally truncated. Useful for meta descriptions, RSS snippets,
 * search excerpts.
 *
 * The callers narrow to a richtext document on `type` alone, so this is the
 * single place that tolerates a malformed `content` — a non-array field or a
 * nullish node is skipped rather than thrown on.
 */
export function extractPlainText(
  richtext: { content?: StoryblokRichTextNode[] } | null | undefined,
  maxLength?: number,
): string {
  const content = richtext?.content;
  if (!Array.isArray(content)) {
    return "";
  }
  const walk = (nodes: StoryblokRichTextNode[]): string =>
    nodes
      .map((node) => {
        if (!node) {
          return "";
        }
        if (node.type === "text" && node.text) {
          return node.text;
        }
        return Array.isArray(node.content) ? walk(node.content) : "";
      })
      .join(" ")
      .trim();
  const text = walk(content);
  return maxLength ? text.slice(0, maxLength) : text;
}
