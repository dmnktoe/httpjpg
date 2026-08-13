interface RichTextMark {
  type?: string;
  attrs?: Record<string, unknown>;
}

interface RichTextNode {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: RichTextMark[];
  content?: RichTextNode[];
}

const MAX_HEADING_LEVEL = 6;

function escapeText(text: string): string {
  return text.replace(/([\\`*_[\]])/g, "\\$1");
}

function attrString(attrs: Record<string, unknown> | undefined, key: string): string {
  const value = attrs?.[key];
  return typeof value === "string" ? value : "";
}

function markHref(mark: RichTextMark): string {
  const href = attrString(mark.attrs, "href") || attrString(mark.attrs, "url");
  const anchor = attrString(mark.attrs, "anchor");
  const linktype = attrString(mark.attrs, "linktype");

  const base = linktype === "story" && href && !href.startsWith("/") ? `/${href}` : href;
  return anchor ? `${base}#${anchor}` : base;
}

/**
 * Takes the raw text and escapes it here rather than at the call site: a code
 * span is literal, so Markdown never processes escapes inside one and a
 * pre-escaped `foo_bar` would render its backslash.
 */
function applyMarks(raw: string, marks: RichTextMark[] | undefined): string {
  if (!marks?.length) {
    return escapeText(raw);
  }

  if (marks.some((mark) => mark.type === "code")) {
    const link = marks.find((mark) => mark.type === "link");
    const code = `\`${raw.replace(/`/g, "")}\``;
    const href = link ? markHref(link) : "";
    return href ? `[${code}](${href})` : code;
  }

  let out = escapeText(raw);
  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        out = `**${out}**`;
        break;
      case "italic":
        out = `*${out}*`;
        break;
      case "strike":
        out = `~~${out}~~`;
        break;
      case "link": {
        const href = markHref(mark);
        out = href ? `[${out}](${href})` : out;
        break;
      }
      default:
        break;
    }
  }
  return out;
}

function renderInline(nodes: RichTextNode[] | undefined): string {
  if (!nodes?.length) {
    return "";
  }

  return nodes
    .map((node) => {
      if (node.type === "hard_break") {
        return "  \n";
      }
      if (node.type === "text") {
        return applyMarks(node.text ?? "", node.marks);
      }
      if (node.type === "emoji") {
        return attrString(node.attrs, "name") ? `:${attrString(node.attrs, "name")}:` : "";
      }
      if (node.type === "image") {
        return renderImage(node);
      }
      return renderInline(node.content);
    })
    .join("");
}

function renderImage(node: RichTextNode): string {
  const src = attrString(node.attrs, "src");
  if (!src) {
    return "";
  }
  const alt = escapeText(attrString(node.attrs, "alt"));
  const title = attrString(node.attrs, "title");
  return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
}

function renderList(node: RichTextNode, ordered: boolean): string {
  return (node.content ?? [])
    .map((item, index) => {
      const bullet = ordered ? `${index + 1}.` : "-";
      const body = renderBlocks(item.content).trim();
      if (!body) {
        return "";
      }
      const [first, ...rest] = body.split("\n");
      const continuation = rest.map((line) => (line ? `  ${line}` : line));
      return [`${bullet} ${first}`, ...continuation].join("\n");
    })
    .filter(Boolean)
    .join("\n");
}

function renderBlock(node: RichTextNode): string {
  switch (node.type) {
    case "heading": {
      const rawLevel = Number(node.attrs?.level ?? 1);
      const level = Math.min(
        Math.max(Number.isFinite(rawLevel) ? rawLevel : 1, 1),
        MAX_HEADING_LEVEL,
      );
      const text = renderInline(node.content).trim();
      return text ? `${"#".repeat(level)} ${text}` : "";
    }
    case "paragraph":
      return renderInline(node.content).trim();
    case "bullet_list":
      return renderList(node, false);
    case "ordered_list":
      return renderList(node, true);
    case "blockquote": {
      const body = renderBlocks(node.content).trim();
      return body
        .split("\n")
        .map((line) => (line ? `> ${line}` : ">"))
        .join("\n");
    }
    case "code_block": {
      const language = attrString(node.attrs, "class").replace(/^language-/, "");
      const code = (node.content ?? []).map((child) => child.text ?? "").join("");
      return `\`\`\`${language}\n${code}\n\`\`\``;
    }
    case "horizontal_rule":
      return "---";
    case "image":
      return renderImage(node);
    case "hard_break":
      return "";
    default:
      return renderInline(node.content).trim();
  }
}

function renderBlocks(nodes: RichTextNode[] | undefined): string {
  if (!nodes?.length) {
    return "";
  }
  return nodes
    .map(renderBlock)
    .filter((block) => block.length > 0)
    .join("\n\n");
}

export function richTextToMarkdown(richtext: { content?: unknown } | null | undefined): string {
  const content = richtext?.content;
  if (!Array.isArray(content)) {
    return "";
  }
  return renderBlocks(content as RichTextNode[]).trim();
}
