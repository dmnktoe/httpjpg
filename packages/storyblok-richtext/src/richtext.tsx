import { Box } from "@httpjpg/ui";
import { createRichTextRenderer, type SbRichTextDoc } from "@storyblok/react/rsc";
import type { ComponentProps, ReactNode } from "react";

import { richTextComponents } from "./richtext-components";

export type ISbRichtext = SbRichTextDoc;

// `optimizeImage` is left off so the custom `image` renderer owns asset handling
// (copyright label, aspect ratio) instead of emitting a bare optimized `<img>`.
const renderRichText = createRichTextRenderer({ components: richTextComponents });

export function renderStoryblokRichText(data?: ISbRichtext | null): ReactNode {
  if (!data) {
    return null;
  }
  return renderRichText(data);
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
