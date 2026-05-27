import type { SbAccordionData } from "@httpjpg/storyblok-utils";
import { Accordion, Box } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbAccordionProps {
  blok: SbAccordionData;
}

export const SbAccordion = memo(function SbAccordion({ blok }: SbAccordionProps) {
  const { items, allowMultiple, variant, size } = blok;

  if (!items?.length) {
    return null;
  }

  const accordionItems = items.map((item) => ({
    id: item._uid,
    title: item.title,
    content: item.content,
    defaultOpen: item.defaultOpen,
  }));

  return (
    <Box {...editableAttrs(blok)} css={spacingCss(blok)}>
      <Accordion
        items={accordionItems}
        allowMultiple={allowMultiple}
        variant={variant}
        size={size}
      />
    </Box>
  );
});

SbAccordion.displayName = "SbAccordion";
