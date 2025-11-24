import { Headline, Paragraph } from "@httpjpg/ui";
import { storyblokEditable } from "@storyblok/react/rsc";
import { memo } from "react";

export interface SbTextProps {
  blok: {
    _uid: string;
    text: string;
    variant?: "heading" | "paragraph";
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    weight?: "normal" | "medium" | "semibold" | "bold";
    align?: "left" | "center" | "right";
    color?: string;
    marginTop?: string;
    marginBottom?: string;
    paddingTop?: string;
    paddingBottom?: string;
  };
}

/**
 * Storyblok Text Component
 * Flexible text component for headings and paragraphs
 */
export const SbText = memo(function SbText({ blok }: SbTextProps) {
  const {
    text,
    variant = "paragraph",
    headingLevel = 2,
    size,
    weight,
    align,
    color,
    marginTop,
    marginBottom,
    paddingTop,
    paddingBottom,
  } = blok;

  const commonStyles = {
    textAlign: align,
    color: color || undefined,
    mt: marginTop || undefined,
    mb: marginBottom || undefined,
    pt: paddingTop || undefined,
    pb: paddingBottom || undefined,
    fontWeight: weight || undefined,
  };

  if (variant === "heading") {
    // Headline only supports levels 1-3
    const validLevel = headingLevel <= 3 ? (headingLevel as 1 | 2 | 3) : 2;
    return (
      <Headline
        {...storyblokEditable(blok)}
        level={validLevel}
        css={commonStyles}
      >
        {text}
      </Headline>
    );
  }

  // Paragraph only supports sm, md, lg
  const validSize = size === "xs" || size === "xl" ? undefined : size;
  return (
    <Paragraph {...storyblokEditable(blok)} size={validSize} css={commonStyles}>
      {text}
    </Paragraph>
  );
});
