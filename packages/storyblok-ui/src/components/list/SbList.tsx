import { Box, ListItem, OrderedList, UnorderedList } from "@httpjpg/ui";
import { memo } from "react";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

type ListSize = "sm" | "md" | "lg";
type ListSpacing = "0" | "1" | "2" | "3" | "4";

interface SbListItemData {
  _uid: string;
  text: string;
}

export interface SbListProps {
  blok: BlokSpacing & {
    _uid: string;
    items: SbListItemData[];
    ordered?: boolean;
    size?: ListSize;
    itemSpacing?: ListSpacing;
    unorderedStyle?: "disc" | "circle" | "square" | "none";
    orderedStyle?: "decimal" | "lower-alpha" | "lower-roman" | "upper-alpha" | "upper-roman";
    color?: string;
  };
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
