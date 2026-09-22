"use client";

import type { PointerEvent, RefObject } from "react";
import { useRef, useState } from "react";

import { clampFloatingMediaPoint, FLOATING_MEDIA_DRAG_THRESHOLD_PX } from "./lib";

interface DragSession {
  pointerId: number;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  width: number;
  height: number;
  moved: boolean;
}

export interface UseFloatingMediaDragResult<T extends HTMLElement> {
  rootRef: RefObject<T | null>;
  offset: { x: number; y: number } | null;
  dragging: boolean;
  handlePointerDown: (event: PointerEvent<HTMLElement>) => void;
  handlePointerMove: (event: PointerEvent<HTMLElement>) => void;
  handlePointerUp: (event: PointerEvent<HTMLElement>) => void;
}

export function useFloatingMediaDrag<T extends HTMLElement>(
  onSelect: () => void,
): UseFloatingMediaDragResult<T> {
  const rootRef = useRef<T | null>(null);
  const dragRef = useRef<DragSession | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0) {
      return;
    }
    onSelect();
    const origin = event.target;
    if (
      origin instanceof Element &&
      origin.closest("[data-floating-no-drag]") &&
      event.currentTarget.contains(origin)
    ) {
      return;
    }
    const node = rootRef.current ?? event.currentTarget;
    const rect = node.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origX: offset?.x ?? rect.left,
      origY: offset?.y ?? rect.top,
      width: rect.width,
      height: rect.height,
      moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (
      !drag.moved &&
      dx * dx + dy * dy < FLOATING_MEDIA_DRAG_THRESHOLD_PX * FLOATING_MEDIA_DRAG_THRESHOLD_PX
    ) {
      return;
    }
    drag.moved = true;
    if (!dragging) {
      setDragging(true);
    }
    setOffset(
      clampFloatingMediaPoint(
        drag.origX + dx,
        drag.origY + dy,
        window.innerWidth,
        window.innerHeight,
        {
          width: drag.width,
          height: drag.height,
        },
      ),
    );
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }
    dragRef.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  return {
    rootRef,
    offset,
    dragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
