"use client";

import { Box, FeedPanel, type FeedPanelItem, useDesktopDrag } from "@httpjpg/ui";
import { usePathname } from "next/navigation";
import { type MouseEvent, type PointerEvent, useRef } from "react";

export interface FeedPanelWidgetProps {
  items: FeedPanelItem[];
}

const FEED_PATH = "/feed";

const FLOATING_QUERY = "(min-width: 768px)";

const DRAG_THRESHOLD_PX = 4;

export function FeedPanelWidget({ items }: FeedPanelWidgetProps) {
  const pathname = usePathname();
  const { offset, handlers } = useDesktopDrag<HTMLDivElement>({ onSelect: noop });
  const pressRef = useRef<{ x: number; y: number } | null>(null);
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

  const handlePointerEnd = (
    event: PointerEvent<HTMLDivElement>,
    end: typeof handlers.onPointerUp,
  ) => {
    end(event);
    if (draggedRef.current) {
      window.setTimeout(() => {
        draggedRef.current = false;
      }, 0);
    }
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
        onPointerUp={(event: PointerEvent<HTMLDivElement>) =>
          handlePointerEnd(event, handlers.onPointerUp)
        }
        onPointerCancel={(event: PointerEvent<HTMLDivElement>) =>
          handlePointerEnd(event, handlers.onPointerCancel)
        }
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
