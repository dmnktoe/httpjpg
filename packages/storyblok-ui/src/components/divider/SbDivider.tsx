import { Divider, type DividerProps } from "@httpjpg/ui";
import { memo } from "react";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbDividerProps {
  blok: BlokSpacing & {
    _uid: string;
    orientation?: DividerProps["orientation"];
    variant?: DividerProps["variant"];
    pattern?: string;
    thickness?: string;
    color?: string;
    spacing?: string;
    label?: string;
  };
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
