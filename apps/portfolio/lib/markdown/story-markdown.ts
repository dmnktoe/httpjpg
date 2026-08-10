import { storyblokHref } from "@httpjpg/storyblok-ui";
import { richTextToMarkdown } from "@httpjpg/storyblok-utils";

/**
 * Render a story's blok tree as Markdown.
 *
 * This is the same content the page renders, in the form an agent, a reader
 * mode, or a `curl` can consume. It is deliberately a separate walk from
 * `collectStoryText`: that one flattens everything into a search excerpt and
 * throws away structure, this one keeps it.
 *
 * Unknown bloks recurse into whatever child bloks they hold rather than being
 * skipped, so a new blok degrades to its contents instead of a hole.
 */

interface Blok {
  component?: string;
  [key: string]: unknown;
}

/** Bounds the walk so a cyclic payload cannot hang a request. */
const MAX_DEPTH = 12;

const MAX_HEADING_LEVEL = 6;

/** Keys holding child bloks, checked in order when a blok is not handled. */
const CHILD_KEYS = ["body", "content", "items", "grid_items"];

function str(blok: Blok, key: string): string {
  const value = blok[key];
  return typeof value === "string" ? value.trim() : "";
}

function asset(value: unknown): { url: string; alt: string } | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value as { filename?: unknown; alt?: unknown };
  if (typeof record.filename !== "string" || !record.filename) {
    return null;
  }
  return { url: record.filename, alt: typeof record.alt === "string" ? record.alt : "" };
}

function assets(value: unknown): Array<{ url: string; alt: string }> {
  return Array.isArray(value) ? value.map(asset).filter((item) => item !== null) : [];
}

function bloks(value: unknown): Blok[] {
  return Array.isArray(value)
    ? (value.filter((item) => item && typeof item === "object") as Blok[])
    : [];
}

function href(blok: Blok, key = "link"): string {
  const link = blok[key];
  if (!link || typeof link !== "object") {
    return "";
  }
  return storyblokHref(link as never) || "";
}

function image(url: string, alt: string): string {
  return `![${alt.replace(/[[\]]/g, "")}](${url})`;
}

function caption(blok: Blok): string {
  const rendered = richTextToMarkdown(blok.caption as never);
  return rendered ? `*${rendered.replace(/\n+/g, " ")}*` : "";
}

function joinBlocks(parts: Array<string | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join("\n\n");
}

function renderBlok(blok: Blok, depth: number): string {
  if (depth > MAX_DEPTH) {
    return "";
  }

  const children = (key: string) => renderBloks(bloks(blok[key]), depth + 1);

  switch (blok.component) {
    // Layout: no output of their own, just their contents.
    case "page":
    case "work":
      return children("body");
    case "section":
    case "grid_item":
      return children("content");
    case "container":
      return children("body");
    case "grid":
      return children("items");

    case "headline": {
      const level = Math.min(Number(blok.level) || 2, MAX_HEADING_LEVEL);
      const text = str(blok, "text");
      return text ? `${"#".repeat(level)} ${text}` : "";
    }
    case "paragraph":
    case "marquee":
      return str(blok, "text");
    case "richtext":
      return richTextToMarkdown(blok.content as never);

    case "list": {
      const ordered = blok.ordered === true;
      return bloks(blok.items)
        .map((item, index) => {
          const text = str(item, "text");
          return text ? `${ordered ? `${index + 1}.` : "-"} ${text}` : "";
        })
        .filter(Boolean)
        .join("\n");
    }

    case "accordion":
      return joinBlocks(
        bloks(blok.items).map((item) =>
          joinBlocks([str(item, "title") && `### ${str(item, "title")}`, str(item, "content")]),
        ),
      );

    case "callout": {
      const body = joinBlocks([
        str(blok, "title") && `**${str(blok, "title")}**`,
        str(blok, "body"),
      ]);
      return body
        .split("\n")
        .map((line) => (line ? `> ${line}` : ">"))
        .join("\n");
    }

    case "code_block": {
      const code = typeof blok.code === "string" ? blok.code : "";
      if (!code) {
        return "";
      }
      const filename = str(blok, "filename");
      const fence = `\`\`\`${str(blok, "language")}\n${code.replace(/\n+$/, "")}\n\`\`\``;
      return filename ? `**${filename}**\n\n${fence}` : fence;
    }

    case "stats":
      return bloks(blok.items)
        .map((item) => {
          const line = [str(item, "value"), str(item, "label")].filter(Boolean).join(" — ");
          const note = str(item, "caption");
          return line ? `- ${line}${note ? ` (${note})` : ""}` : "";
        })
        .filter(Boolean)
        .join("\n");

    case "badges":
      return bloks(blok.items)
        .map((item) => (str(item, "src") ? image(str(item, "src"), str(item, "alt")) : ""))
        .filter(Boolean)
        .join(" ");

    case "link":
    case "button": {
      const text = str(blok, "text");
      const url = href(blok);
      if (!text) {
        return "";
      }
      return url ? `[${text}](${url})` : text;
    }

    case "divider":
      return str(blok, "label") || "---";

    case "work_card": {
      const title = str(blok, "title");
      const slug = str(blok, "slug");
      const description = str(blok, "description");
      const label = slug ? `[${title}](/work/${slug})` : title;
      return title ? `- ${label}${description ? ` — ${description}` : ""}` : "";
    }

    case "image":
    case "scroll_clip_image": {
      const source = asset(blok.image);
      if (!source) {
        return "";
      }
      return joinBlocks([image(source.url, str(blok, "alt") || source.alt), caption(blok)]);
    }

    case "slideshow":
      return joinBlocks([
        assets(blok.images)
          .map((item) => image(item.url, item.alt))
          .join("\n"),
        caption(blok),
      ]);

    case "video": {
      const url = str(blok, "videoUrl") || asset(blok.video)?.url || "";
      return joinBlocks([url && `[Video](${url})`, caption(blok)]);
    }

    case "music_player": {
      const title = str(blok, "title");
      const artist = str(blok, "artist");
      const src = str(blok, "src");
      const label = [title, artist].filter(Boolean).join(" — ");
      if (!label) {
        return "";
      }
      return src ? `- [${label}](${src})` : `- ${label}`;
    }

    // Rendered from resolved stories the CDN only fills in for the page
    // itself, and the index already lists that work — so nothing to add here.
    case "work_list":
    case "icon":
      return "";

    default: {
      for (const key of CHILD_KEYS) {
        const nested = bloks(blok[key]);
        if (nested.length > 0) {
          return renderBloks(nested, depth + 1);
        }
      }
      return "";
    }
  }
}

function renderBloks(list: Blok[], depth: number): string {
  return joinBlocks(list.map((blok) => renderBlok(blok, depth)));
}

/** Markdown for one story's content. Empty when the story renders no text. */
export function storyContentToMarkdown(content: unknown): string {
  if (!content || typeof content !== "object") {
    return "";
  }
  return renderBlok(content as Blok, 0).trim();
}
