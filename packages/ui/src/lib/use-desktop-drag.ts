"use client";

import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { type BoxSize, clampToViewport, type ViewportPoint } from "./desktop-scatter";

export interface DesktopDragOptions {
  /** Pointer down anywhere on the item: select it and raise it. */
  onSelect: () => void;
  /** Pointer downs inside this selector select but never drag (e.g. video controls). */
  noDragSelector?: string;
}

export interface DesktopDragHandlers<T extends HTMLElement> {
  onPointerDown: (event: PointerEvent<T>) => void;
  onPointerMove: (event: PointerEvent<T>) => void;
  onPointerUp: (event: PointerEvent<T>) => void;
  onPointerCancel: (event: PointerEvent<T>) => void;
}

export interface DesktopDrag<T extends HTMLElement> {
  /** Pixel position once dragged; null while the item sits at its scatter position. */
  offset: ViewportPoint | null;
  dragging: boolean;
  handlers: DesktopDragHandlers<T>;
}

/**
 * Pointer drag for an absolutely positioned desktop item (icon, media window).
 * Starts after a small threshold so clicks and double-clicks still land, and
 * re-clamps into the viewport on resize.
 */
export function useDesktopDrag<T extends HTMLElement>({
  onSelect,
  noDragSelector,
}: DesktopDragOptions): DesktopDrag<T> {
  const dragRef = useRef<DragSession | null>(null);
  const sizeRef = useRef<BoxSize>({ width: 0, height: 0 });
  const [offset, setOffset] = useState<ViewportPoint | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    function reclamp() {
      setOffset((current) => (current ? clampToWindow(current, sizeRef.current) : current));
    }
    window.addEventListener("resize", reclamp);
    window.addEventListener("orientationchange", reclamp);
    return () => {
      window.removeEventListener("resize", reclamp);
      window.removeEventListener("orientationchange", reclamp);
    };
  }, []);

  function handlePointerDown(event: PointerEvent<T>) {
    if (event.button !== 0) {
      return;
    }
    onSelect();
    const origin = event.target;
    if (noDragSelector && origin instanceof Element && origin.closest(noDragSelector)) {
      return;
    }
    const node = event.currentTarget;
    const rect = node.getBoundingClientRect();
    sizeRef.current = { width: rect.width, height: rect.height };
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origX: offset?.x ?? rect.left,
      origY: offset?.y ?? rect.top,
      moved: false,
    };
    node.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<T>) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
      return;
    }
    drag.moved = true;
    if (!dragging) {
      setDragging(true);
    }
    setOffset(clampToWindow({ x: drag.origX + dx, y: drag.origY + dy }, sizeRef.current));
  }

  function handlePointerEnd(event: PointerEvent<T>) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }
    dragRef.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  return {
    offset,
    dragging,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
    },
  };
}

function clampToWindow(point: ViewportPoint, size: BoxSize): ViewportPoint {
  return clampToViewport(
    point,
    { width: window.innerWidth, height: window.innerHeight },
    size,
    VIEWPORT_MARGIN_PX,
  );
}

interface DragSession {
  pointerId: number;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  moved: boolean;
}

const DRAG_THRESHOLD_PX = 4;
const VIEWPORT_MARGIN_PX = 8;
