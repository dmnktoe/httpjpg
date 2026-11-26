"use client";

import { Box, FeedPanel, type FeedPanelItem, FloatingWidget } from "@httpjpg/ui";
import { usePathname } from "next/navigation";

export interface FeedPanelWidgetProps {
  items: FeedPanelItem[];
}

const FEED_PATH = "/feed";

export function FeedPanelWidget({ items }: FeedPanelWidgetProps) {
  const pathname = usePathname();

  if (!items.length || pathname === FEED_PATH || pathname?.startsWith(`${FEED_PATH}/`)) {
    return null;
  }

  return (
    <Box
      as="aside"
      aria-label="Latest from the feed"
      css={{ px: "4", py: "10", bg: "pageBg", md: { p: "0" } }}
    >
      <FloatingWidget
        data-feed-panel=""
        css={{
          w: "full",
          maxW: "80",
          mx: "auto",
          md: {
            position: "fixed",
            bottom: "6",
            left: "6",
            zIndex: "widget",
            w: "56",
            cursor: "grab",
            userSelect: "none",
            touchAction: "none",
          },
        }}
      >
        <FeedPanel items={items} href={FEED_PATH} />
      </FloatingWidget>
    </Box>
  );
}
