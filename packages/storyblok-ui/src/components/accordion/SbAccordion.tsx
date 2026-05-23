import { Accordion, type AccordionProps, Box } from "@httpjpg/ui";
import { memo } from "react";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

interface SbAccordionItemData {
  _uid: string;
  title: string;
  content: string;
  defaultOpen?: boolean;
}

export interface SbAccordionProps {
  blok: BlokSpacing & {
    _uid: string;
    items: SbAccordionItemData[];
    allowMultiple?: boolean;
    variant?: AccordionProps["variant"];
    size?: AccordionProps["size"];
  };
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
