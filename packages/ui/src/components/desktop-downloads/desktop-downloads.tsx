"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { css } from "styled-system/css";

import { useHasMounted } from "../../lib/use-has-mounted";
import { DesktopDownloadIcon } from "./desktop-download-icon";
import { desktopIconPositions, type DesktopDownloadItem, visibleDesktopDownloads } from "./lib";

export type { DesktopDownloadItem, DesktopFileKind } from "./lib";
export { DESKTOP_ICON_SRC, fileKindFromSource } from "./lib";

export interface DesktopDownloadsProps {
  items: DesktopDownloadItem[];
}

export function DesktopDownloads({ items }: DesktopDownloadsProps) {
  const mounted = useHasMounted();
  const layerRef = useRef<HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [topId, setTopId] = useState<string | null>(null);

  const visible = useMemo(() => visibleDesktopDownloads(items), [items]);
  const positions = useMemo(() => desktopIconPositions(visible.map((item) => item.id)), [visible]);

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
      aria-label="Work downloads"
      data-desktop-downloads=""
      className={css({
        position: "fixed",
        inset: "0",
        zIndex: "widget",
        pointerEvents: "none",
        overflow: "hidden",
      })}
    >
      {visible.map((item, index) => (
        <DesktopDownloadIcon
          key={item.id}
          item={item}
          position={positions[index] ?? { left: 8, top: 16 }}
          selected={selectedId === item.id}
          stackingOrder={topId === item.id ? visible.length + 1 : index + 1}
          onSelect={() => {
            setSelectedId(item.id);
            setTopId(item.id);
          }}
          onActivate={() => setSelectedId(item.id)}
        />
      ))}
    </section>,
    document.body,
  );
}
