"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { css } from "styled-system/css";

import { scatterPositions } from "../../lib/desktop-scatter";
import { useHasMounted } from "../../lib/use-has-mounted";
import { DesktopMediaWindow } from "./desktop-media-window";
import { DESKTOP_MEDIA_SCATTER, type DesktopMediaItem, visibleDesktopMedia } from "./lib";

export type { DesktopMediaItem, DesktopMediaKind } from "./lib";
export { DESKTOP_MEDIA_WIDTH, desktopMediaSizesAttr } from "./lib";

export interface DesktopMediaProps {
  items: DesktopMediaItem[];
}

export function DesktopMedia({ items }: DesktopMediaProps) {
  const mounted = useHasMounted();
  const layerRef = useRef<HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [topId, setTopId] = useState<string | null>(null);

  const visible = useMemo(() => visibleDesktopMedia(items), [items]);
  const positions = useMemo(
    () =>
      scatterPositions(
        visible.map((item) => item.id),
        DESKTOP_MEDIA_SCATTER,
      ),
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
      data-desktop-media=""
      className={css({
        position: "fixed",
        inset: "0",
        zIndex: "widget",
        pointerEvents: "none",
        overflow: "hidden",
      })}
    >
      {visible.map((item, index) => (
        <DesktopMediaWindow
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
