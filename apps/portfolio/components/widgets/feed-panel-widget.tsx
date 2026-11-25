"use client";

import { Box, FeedPanel, type FeedPanelItem, useDesktopDrag } from "@httpjpg/ui";
import { usePathname } from "next/navigation";
import { type MouseEvent, type PointerEvent, useRef } from "react";

export interface FeedPanelWidgetProps {
  items: FeedPanelItem[];
}

const FEED_PATH = "/feed";

/** Matches Panda's `md`: below it the panel is a block in the page flow. */
const FLOATING_QUERY = "(min-width: 768px)";

/** The drag hook's own threshold: a press that moves less is a click. */
const DRAG_THRESHOLD_PX = 4;

/**
 * Places the feed panel: a block above the footer on a phone, floating and
 * draggable from `md` up — bottom left, clear of the now-playing widget.
 * Hidden on the feed itself, where it would only repeat the page.
 */
export function FeedPanelWidget({ items }: FeedPanelWidgetProps) {
  const pathname = usePathname();
  const { offset, handlers } = useDesktopDrag<HTMLDivElement>({ onSelect: noop });
  const pressRef = useRef<{ x: number; y: number } | null>(null);
  // Survives the pointer-up that ends a drag, so the click it produces can be swallowed.
  const draggedRef = useRef(false);

  if (!items.length || pathname === FEED_PATH || pathname?.startsWith(`${FEED_PATH}/`)) {
    return null;
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    draggedRef.current = false;
    pressRef.current = null;
    if (isFloating()) {
      pressRef.current = { x: event.clientX, y: event.clientY };
      handlers.onPointerDown(event);
      // The hook captures the pointer at once, and a captured pointer's click lands on
      // this wrapper instead of the link. Hold the capture back until it is a drag.
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    if (
      press &&
      !draggedRef.current &&
      Math.hypot(event.clientX - press.x, event.clientY - press.y) >= DRAG_THRESHOLD_PX
    ) {
      draggedRef.current = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    handlers.onPointerMove(event);
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (draggedRef.current) {
      draggedRef.current = false;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <Box
      as="aside"
      aria-label="Latest from the feed"
      css={{ px: "4", py: "10", bg: "pageBg", md: { p: "0" } }}
    >
      <Box
        data-draggable="true"
        data-feed-panel=""
        {...handlers}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onClickCapture={handleClickCapture}
        css={{
          w: "full",
          maxW: "80",
          mx: "auto",
          md: {
            position: "fixed",
            bottom: "10",
            left: "10",
            zIndex: "widget",
            w: "56",
            cursor: "grab",
            userSelect: "none",
            touchAction: "none",
          },
        }}
        style={offset ? { left: offset.x, top: offset.y, bottom: "auto" } : undefined}
      >
        <FeedPanel items={items} href={FEED_PATH} />
      </Box>
    </Box>
  );
}

function isFloating(): boolean {
  return Boolean(window.matchMedia?.(FLOATING_QUERY).matches);
}

function noop() {}
