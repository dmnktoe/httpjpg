"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { css } from "styled-system/css";

import { useHasMounted } from "../../lib/use-has-mounted";
import { FloatingMediaWindow } from "./floating-media-window";
import { floatingMediaPositions, type FloatingMediaItem, visibleFloatingMedia } from "./lib";

export type { FloatingMediaItem, FloatingMediaKind } from "./lib";
export { FLOATING_MEDIA_WIDTH, floatingMediaKindFromSrc } from "./lib";

export interface FloatingMediaProps {
  items: FloatingMediaItem[];
}

export function FloatingMedia({ items }: FloatingMediaProps) {
  const mounted = useHasMounted();
  const layerRef = useRef<HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [topId, setTopId] = useState<string | null>(null);

  const visible = useMemo(() => visibleFloatingMedia(items), [items]);
  const positions = useMemo(
    () => floatingMediaPositions(visible.map((item) => item.id)),
    [visible],
  );

  useEffect(() => {
    if (visible.length === 0) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && layerRef.current?.contains(target)) {
        return;
      }
      setSelectedId(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [visible.length]);

  if (!mounted || visible.length === 0) {
    return null;
  }

  return createPortal(
    <section
      ref={layerRef}
      aria-label="Work media"
      data-floating-media=""
      className={css({
        position: "fixed",
        inset: "0",
        zIndex: "widget",
        pointerEvents: "none",
        overflow: "hidden",
      })}
    >
      {visible.map((item, index) => (
        <FloatingMediaWindow
          key={item.id}
          item={item}
          position={positions[index] ?? { left: 8, top: 12 }}
          selected={selectedId === item.id}
          stackingOrder={topId === item.id ? visible.length + 1 : index + 1}
          onSelect={() => {
            setSelectedId(item.id);
            setTopId(item.id);
          }}
        />
      ))}
    </section>,
    document.body,
  );
}
