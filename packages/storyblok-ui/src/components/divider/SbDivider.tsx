import type { SbDividerData } from "@httpjpg/storyblok-utils";
import { Divider } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbDividerProps {
  blok: SbDividerData;
}

export const SbDivider = memo(function SbDivider({ blok }: SbDividerProps) {
  const { orientation, variant, pattern, thickness, color, spacing, label } = blok;

  return (
    <Divider
      {...editableAttrs(blok)}
      orientation={orientation}
      variant={variant}
      pattern={pattern || undefined}
      thickness={thickness || undefined}
      color={color || undefined}
      spacing={spacing || undefined}
      css={spacingCss(blok)}
    >
      {label || undefined}
    </Divider>
  );
});

SbDivider.displayName = "SbDivider";
