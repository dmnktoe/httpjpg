import { StoryblokRichText, type StoryblokRichTextProps } from "@httpjpg/storyblok-richtext";
import { Box } from "@httpjpg/ui";
import { memo } from "react";

export interface SbCaptionProps {
  data: StoryblokRichTextProps["data"];
}

function hasText(nodes: unknown[]): boolean {
  return nodes.some((node) => {
    const n = node as { type?: string; text?: string; content?: unknown[] };
    if (n.type === "text" && n.text?.trim()) {
      return true;
    }
    return Array.isArray(n.content) ? hasText(n.content) : false;
  });
}

export const SbCaption = memo(function SbCaption({ data }: SbCaptionProps) {
  if (!data?.content?.length || !hasText(data.content)) {
    return null;
  }

  return (
    <Box css={{ mt: "2", color: "neutral.600", fontSize: "sm", lineHeight: "1.5" }}>
      <StoryblokRichText data={data} />
    </Box>
  );
});

SbCaption.displayName = "SbCaption";
