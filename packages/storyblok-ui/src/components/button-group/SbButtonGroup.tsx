import type { SbButtonGroupData } from "@httpjpg/storyblok-utils";
import { ButtonGroup } from "@httpjpg/ui";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbButtonGroupProps {
  blok: SbButtonGroupData;
}

/** `SbButton` wraps its button in an editable `Box`, so `stretch` needs one level more reach. */
const STRETCH_THROUGH_WRAPPER = { "& > * > *": { width: "100%" } };

export const SbButtonGroup = memo(function SbButtonGroup({ blok }: SbButtonGroupProps) {
  const { buttons, direction, align, justify, gap, wrap, stretch } = blok;

  if (!buttons?.length) {
    return null;
  }

  return (
    <ButtonGroup
      {...editableAttrs(blok)}
      direction={direction}
      align={align}
      justify={justify}
      gap={gap || undefined}
      wrap={wrap}
      stretch={stretch}
      css={{ ...(stretch && STRETCH_THROUGH_WRAPPER), ...spacingCss(blok) }}
    >
      {buttons.map((button) => (
        <StoryblokServerComponent key={button._uid} blok={button} />
      ))}
    </ButtonGroup>
  );
});

SbButtonGroup.displayName = "SbButtonGroup";
