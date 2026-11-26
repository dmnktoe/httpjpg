"use client";

import {
  type HTMLAttributes,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useRef,
} from "react";
import type { SystemStyleObject } from "styled-system/types";

import { useDesktopDrag } from "../../lib/use-desktop-drag";
import { Box } from "../box/box";

export interface FloatingWidgetProps extends Omit<HTMLAttributes<HTMLDivElement>, "css"> {
  children: ReactNode;
  /** The media query from which the widget is `position: fixed` and can be dragged. @default "(min-width: 48rem)" */
  floatingQuery?: string;
  /** Where it sits until it is dragged, e.g. `{ md: { position: "fixed", bottom: "6", left: "6" } }`. */
  css?: SystemStyleObject;
}

const DRAG_THRESHOLD_PX = 4;

export function FloatingWidget({
  children,
  floatingQuery = "(min-width: 48rem)",
  css: cssProp,
  style,
  ...props
}: FloatingWidgetProps) {
  const { offset, handlers } = useDesktopDrag<HTMLDivElement>({ onSelect: noop });
  const pressRef = useRef<{ x: number; y: number } | null>(null);
  const draggedRef = useRef(false);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    draggedRef.current = false;
    pressRef.current = null;
    if (window.matchMedia?.(floatingQuery).matches) {
      pressRef.current = { x: event.clientX, y: event.clientY };
      handlers.onPointerDown(event);
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    if (press && !(event.buttons & 1)) {
      pressRef.current = null;
      draggedRef.current = false;
      handlers.onPointerCancel(event);
      return;
    }
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

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    draggedRef.current = false;
    handlers.onPointerCancel(event);
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!draggedRef.current || event.detail === 0) {
      return;
    }
    draggedRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Box
      data-draggable="true"
      {...props}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlePointerCancel}
      onClickCapture={handleClickCapture}
      css={cssProp}
      style={
        offset ? { ...style, top: offset.y, right: "auto", bottom: "auto", left: offset.x } : style
      }
    >
      {children}
    </Box>
  );
}

function noop() {}
