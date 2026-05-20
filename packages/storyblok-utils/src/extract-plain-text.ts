interface RichTextNode {
  type?: string;
  text?: string;
  content?: RichTextNode[];
}

/**
 * Walk a Storyblok rich-text document and return the concatenated text,
 * optionally truncated. Useful for meta descriptions, RSS snippets,
 * search excerpts.
 */
export function extractPlainText(
  richtext: { content?: RichTextNode[] } | null | undefined,
  maxLength?: number,
): string {
  if (!richtext?.content) {
    return "";
  }
  const walk = (nodes: RichTextNode[]): string =>
    nodes
      .map((node) => {
        if (node.type === "text" && node.text) {
          return node.text;
        }
        if (node.content) {
          return walk(node.content);
        }
        return "";
      })
      .join(" ")
      .trim();
  const text = walk(richtext.content);
  return maxLength ? text.slice(0, maxLength) : text;
}
