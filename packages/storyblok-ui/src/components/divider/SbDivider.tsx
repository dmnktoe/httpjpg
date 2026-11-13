import type { SbDividerData } from "@httpjpg/storyblok-utils";
import { Divider } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, spacingStyle } from "../../lib/use-blok";

export interface SbDividerProps {
  blok: SbDividerData;
}

export const SbDivider = memo(function SbDivider({ blok }: SbDividerProps) {
  const { orientation, variant, pattern, thickness, color, spacing, label } = blok;
  // The Divider's own margin, restated so a tablet-only value doesn't drop it on mobile.
  const space = spacing || "4";
  const defaults = orientation === "vertical" ? { ml: space, mr: space } : { mt: space, mb: space };

  return (
    <Divider
      {...editableAttrs(blok)}
      orientation={orientation}
      variant={variant}
      pattern={pattern || undefined}
      thickness={thickness || undefined}
      color={color || undefined}
      spacing={spacing || undefined}
      {...spacingStyle(blok, defaults)}
    >
      {label || undefined}
    </Divider>
  );
});

SbDivider.displayName = "SbDivider";
