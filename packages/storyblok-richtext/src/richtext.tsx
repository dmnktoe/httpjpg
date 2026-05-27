import { Box } from "@httpjpg/ui";
import { richTextResolver, type StoryblokRichTextDocumentNode } from "@storyblok/richtext";
import { type ComponentProps, createElement, isValidElement, type ReactNode } from "react";

import { type TagAttrs, tagRenderers } from "./tag-renderers";

export type ISbRichtext = StoryblokRichTextDocumentNode;

interface RenderHTMLArgs {
  HTMLAttributes: Record<string, unknown>;
}

const cleanAttrs = (attrs: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (v != null && v !== "") {
      out[k] = v;
    }
  }
  return out;
};

/** Preserves the Storyblok `copyright` attribute on images, which the default v4 image extension drops. */
const customImageExtension = {
  name: "image",
  type: "node",
  options: {},
  config: {
    renderHTML({ HTMLAttributes }: RenderHTMLArgs) {
      const { src, alt, title, copyright, srcset, sizes } = HTMLAttributes as Record<
        string,
        string | undefined
      >;
      return ["img", cleanAttrs({ src, alt, title, copyright, srcset, sizes })];
    },
  },
};

/** Marks inline code so renderFn can style it differently from code-block code. */
const inlineCodeExtension = {
  name: "code",
  type: "mark",
  options: {},
  config: {
    renderHTML({ HTMLAttributes }: RenderHTMLArgs) {
      return ["code", { ...HTMLAttributes, "data-inline-code": "true" }, 0];
    },
  },
};

/** Parse Storyblok WYSIWYG inline `style="color: red"` strings to React objects. */
function parseStyleProp(value: unknown): Record<string, string> | undefined {
  if (value && typeof value === "object") {
    return value as Record<string, string>;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const result: Record<string, string> = {};
  for (const decl of value.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) {
      continue;
    }
    const prop = decl.slice(0, idx).trim();
    const val = decl.slice(idx + 1).trim();
    if (!prop || !val) {
      continue;
    }
    const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    result[camel] = val;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function normalizeHtmlAttrs(attrs: TagAttrs) {
  const {
    class: cls,
    className,
    style,
    key,
    ...rest
  } = attrs as TagAttrs & {
    class?: unknown;
    className?: unknown;
    style?: unknown;
    key?: string;
  };
  const safeStyle = parseStyleProp(style);
  const finalClass = (cls ?? className) as string | undefined;
  const finalAttrs: Record<string, unknown> = { ...rest };
  if (finalClass) {
    finalAttrs.className = String(finalClass);
  }
  if (safeStyle) {
    finalAttrs.style = safeStyle;
  }
  return { key, attrs: finalAttrs };
}

const renderFn = (tag: unknown, rawAttrs: TagAttrs = {}, children?: ReactNode): ReactNode => {
  const { key, attrs } = normalizeHtmlAttrs(rawAttrs);
  const handler = typeof tag === "string" ? tagRenderers[tag] : undefined;
  if (handler) {
    return handler(key, attrs, children);
  }
  return createElement(tag as string, { ...attrs, key }, children);
};

const renderer = richTextResolver<ReactNode>({
  renderFn,
  textFn: (text) => text as ReactNode,
  keyedResolvers: true,
  tiptapExtensions: {
    image: customImageExtension,
    code: inlineCodeExtension,
  },
});

export function renderStoryblokRichText(data?: ISbRichtext | null) {
  if (!data) {
    return null;
  }
  const out = renderer.render(data as never);
  return isValidElement(out) || Array.isArray(out) || typeof out === "string" ? out : null;
}

export interface StoryblokRichTextProps extends ComponentProps<"div"> {
  data?: ISbRichtext | null;
  maxWidth?: string | boolean;
  color?: string;
}

const proseRhythm = {
  "& > *": { marginTop: 0, marginBottom: 0 },
  "& > * + *": { marginTop: "4" },
  "& > * + h1, & > * + h2, & > * + h3": { marginTop: "8" },
  "& > h1 + *, & > h2 + *, & > h3 + *": { marginTop: "3" },
  "& li > p, & li > div": { marginBottom: "0", marginTop: "0" },
} as const;

const colorInherit = {
  "& p, & h1, & h2, & h3, & li, & blockquote, & strong, & em, & a, & li::before": {
    color: "inherit",
  },
} as const;

function resolveMaxWidth(value: string | boolean | undefined): string | undefined {
  if (value === undefined || value === false) {
    return undefined;
  }
  if (value === true) {
    return "65ch";
  }
  return value;
}

export function StoryblokRichText({
  data,
  maxWidth,
  color,
  style,
  ...props
}: StoryblokRichTextProps) {
  if (!data) {
    return null;
  }
  const resolvedMaxWidth = resolveMaxWidth(maxWidth);
  return (
    <Box
      {...props}
      style={color ? { color, ...style } : style}
      css={{
        ...proseRhythm,
        ...(color && colorInherit),
        ...(resolvedMaxWidth && { maxWidth: resolvedMaxWidth }),
      }}
    >
      {renderStoryblokRichText(data)}
    </Box>
  );
}
