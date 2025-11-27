import { Paragraph } from "@httpjpg/ui";
import { storyblokEditable } from "@storyblok/react/rsc";
import { memo } from "react";
import { mapSpacingToToken } from "../../lib/spacing-utils";
import {
  mapColorToToken,
  mapFontSizeToToken,
  mapFontWeightToToken,
} from "../../lib/token-mapping";

export interface SbParagraphProps {
  blok: {
    _uid: string;
    text: string;
    size?: string;
    weight?: string;
    align?: "left" | "center" | "right";
    color?: string;
    marginTop?: string;
    marginBottom?: string;
    paddingTop?: string;
    paddingBottom?: string;
  };
}

/**
 * Storyblok Paragraph Component
 * Body text component with configurable styling
 */
export const SbParagraph = memo(function SbParagraph({
  blok,
}: SbParagraphProps) {
  const {
    text,
    size,
    weight,
    align,
    color,
    marginTop,
    marginBottom,
    paddingTop,
    paddingBottom,
  } = blok;

  // Paragraph only supports sm, md, lg
  const mappedSize = mapFontSizeToToken(size);
  const validSize =
    mappedSize === "xs" || mappedSize === "xl" ? undefined : mappedSize;

  return (
    <Paragraph
      {...storyblokEditable(blok)}
      size={validSize as "sm" | "md" | "lg" | undefined}
      css={{
        textAlign: align,
        color: mapColorToToken(color),
        fontWeight: mapFontWeightToToken(weight),
        mt: mapSpacingToToken(marginTop),
        mb: mapSpacingToToken(marginBottom),
        pt: mapSpacingToToken(paddingTop),
        pb: mapSpacingToToken(paddingBottom),
      }}
    >
      {text}
    </Paragraph>
  );
});
