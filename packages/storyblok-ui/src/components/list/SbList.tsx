import type { SbListData } from "@httpjpg/storyblok-utils";
import { Box, ListItem, OrderedList, UnorderedList } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbListProps {
  blok: SbListData;
}

export const SbList = memo(function SbList({ blok }: SbListProps) {
  const { items, ordered, size, itemSpacing, unorderedStyle, orderedStyle, color } = blok;

  if (!items?.length) {
    return null;
  }

  const renderedItems = items.map((item) => (
    <ListItem key={item._uid} size={size}>
      {item.text}
    </ListItem>
  ));

  const list = ordered ? (
    <OrderedList size={size} listStyle={orderedStyle} spacing={itemSpacing}>
      {renderedItems}
    </OrderedList>
  ) : (
    <UnorderedList size={size} listStyle={unorderedStyle} spacing={itemSpacing}>
      {renderedItems}
    </UnorderedList>
  );

  return (
    <Box {...editableAttrs(blok)} css={{ color, ...spacingCss(blok) }}>
      {list}
    </Box>
  );
});

SbList.displayName = "SbList";
