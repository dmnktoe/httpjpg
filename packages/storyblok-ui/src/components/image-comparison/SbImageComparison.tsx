import type { SbImageComparisonData } from "@httpjpg/storyblok-utils";
import { getResponsiveImage } from "@httpjpg/storyblok-utils";
import { Box, ImageComparisonSlider } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, sizesFromWidths, spacingCss, widthCss } from "../../lib/use-blok";
import { SbCaption, type SbCaptionProps } from "../caption/SbCaption";

export interface SbImageComparisonProps {
  blok: SbImageComparisonData;
}

export const SbImageComparison = memo(function SbImageComparison({ blok }: SbImageComparisonProps) {
  const {
    before,
    after,
    beforeAlt,
    afterAlt,
    caption,
    aspectRatio = "16/9",
    width = "100%",
    widthMd,
    widthLg,
    orientation = "horizontal",
    initialPosition,
    beforeLabel,
    afterLabel,
    showLabels = true,
    showPosition = true,
  } = blok;
  const editable = editableAttrs(blok);

  if (!before?.filename || !after?.filename) {
    return null;
  }

  const beforeImage = getResponsiveImage(before.filename, {
    aspectRatio,
    focus: before.focus || "",
  });
  const afterImage = getResponsiveImage(after.filename, {
    aspectRatio,
    focus: after.focus || "",
  });
  const sizes = sizesFromWidths({ width, widthMd, widthLg });

  return (
    <Box
      {...editable}
      css={{
        mb: "4",
        ...widthCss({ width, widthMd, widthLg }),
        ...spacingCss(blok),
      }}
    >
      <ImageComparisonSlider
        beforeSrc={beforeImage.src}
        afterSrc={afterImage.src}
        beforeSrcSet={beforeImage.srcSet}
        afterSrcSet={afterImage.srcSet}
        sizes={sizes}
        beforeAlt={beforeAlt || before.alt || before.title || ""}
        afterAlt={afterAlt || after.alt || after.title || ""}
        beforeLabel={beforeLabel || "BEFORE"}
        afterLabel={afterLabel || "AFTER"}
        orientation={orientation}
        initialPosition={toPosition(initialPosition)}
        showLabels={showLabels}
        showPosition={showPosition}
        aspectRatio={aspectRatio}
      />
      {!!caption?.content?.length && <SbCaption data={caption as SbCaptionProps["data"]} />}
    </Box>
  );
});

SbImageComparison.displayName = "SbImageComparison";

function toPosition(value: unknown, fallback = 50): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
