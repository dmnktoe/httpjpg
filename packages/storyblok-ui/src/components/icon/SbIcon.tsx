import type { SbIconData } from "@httpjpg/storyblok-utils";
import { Box, Icon } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, spacingStyle } from "../../lib/use-blok";

export interface SbIconProps {
  blok: SbIconData;
}

export const SbIcon = memo(function SbIcon({ blok }: SbIconProps) {
  const { name, size, color, label } = blok;
  const spacing = spacingStyle(blok);

  if (!name) {
    return null;
  }

  return (
    <Box
      {...editableAttrs(blok)}
      css={{ display: "inline-flex", color, ...spacing.css }}
      style={spacing.style}
      aria-label={label || undefined}
    >
      <Icon name={name} size={size || undefined} />
    </Box>
  );
});

SbIcon.displayName = "SbIcon";
