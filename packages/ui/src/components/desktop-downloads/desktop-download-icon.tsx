"use client";

import type { KeyboardEvent, PointerEvent } from "react";
import { useRef, useState } from "react";
import { css } from "styled-system/css";

import { DesktopDownloadPlaceholder } from "./desktop-download-placeholder";
import {
  clampDesktopIconPoint,
  DESKTOP_DRAG_THRESHOLD_PX,
  DESKTOP_ICON_SRC,
  type DesktopDownloadItem,
  type DesktopFileKind,
  type DesktopIconPosition,
  fileKindFromSource,
  triggerDownload,
} from "./lib";

export interface DesktopDownloadIconProps {
  item: DesktopDownloadItem;
  position: DesktopIconPosition;
  selected: boolean;
  stackingOrder: number;
  onSelect: () => void;
  onActivate: () => void;
}

interface DragSession {
  pointerId: number;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  moved: boolean;
}

const LABEL_SHADOW =
  "1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000, 0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000";

export function DesktopDownloadIcon({
  item,
  position,
  selected,
  stackingOrder,
  onSelect,
  onActivate,
}: DesktopDownloadIconProps) {
  const dragRef = useRef<DragSession | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const kind: DesktopFileKind = item.kind ?? fileKindFromSource(item.name, item.url);
  const iconSrc = DESKTOP_ICON_SRC[kind];

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) {
      return;
    }
    const node = event.currentTarget;
    onSelect();
    const rect = node.getBoundingClientRect();
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

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && dx * dx + dy * dy < DESKTOP_DRAG_THRESHOLD_PX * DESKTOP_DRAG_THRESHOLD_PX) {
      return;
    }
    drag.moved = true;
    if (!dragging) {
      setDragging(true);
    }
    setOffset(
      clampDesktopIconPoint(
        drag.origX + dx,
        drag.origY + dy,
        window.innerWidth,
        window.innerHeight,
      ),
    );
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }
    dragRef.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function handleDoubleClick() {
    triggerDownload(item.url, item.name);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      triggerDownload(item.url, item.name);
    }
  }

  return (
    <button
      type="button"
      data-draggable="true"
      data-file-kind={kind}
      aria-pressed={selected}
      aria-label={`Download ${item.name}`}
      title={`${item.name} — double-click to download`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onClick={(event) => {
        event.preventDefault();
        onActivate();
      }}
      className={css({
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1",
        width: "76px",
        margin: "0",
        padding: "1",
        color: "white",
        background: "transparent",
        border: "0",
        appearance: "none",
        pointerEvents: "auto",
        userSelect: "none",
        touchAction: "none",
        overflow: "visible",
        _focusVisible: { outline: "1px dotted", outlineColor: "white", outlineOffset: "1px" },
      })}
      style={{
        zIndex: stackingOrder,
        cursor: dragging ? "grabbing" : "grab",
        ...(offset
          ? { left: offset.x, top: offset.y }
          : {
              left: `clamp(8px, ${position.left}%, calc(100vw - 84px))`,
              top: `clamp(8px, ${position.top}%, calc(100vh - 94px))`,
            }),
      }}
    >
      <span
        className={css({
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "48px",
          height: "48px",
        })}
        style={
          selected
            ? { background: "rgba(49, 106, 197, 0.45)", outline: "1px dotted #ffffff" }
            : undefined
        }
      >
        {iconSrc ? (
          <img
            src={iconSrc}
            alt=""
            width={32}
            height={32}
            draggable={false}
            className={css({
              width: "48px",
              height: "48px",
              pointerEvents: "none",
              imageRendering: "pixelated",
            })}
          />
        ) : (
          <DesktopDownloadPlaceholder kind={kind} />
        )}
      </span>
      <span
        className={css({
          width: "100%",
          fontWeight: "normal",
          lineHeight: "tight",
          textAlign: "center",
          wordBreak: "break-word",
          overflow: "hidden",
          lineClamp: 2,
        })}
        style={{
          color: "#ffffff",
          fontFamily: 'Tahoma, "MS Sans Serif", "Segoe UI", sans-serif',
          fontSize: "11px",
          background: selected ? "#316AC5" : "transparent",
          textShadow: selected ? "none" : LABEL_SHADOW,
        }}
      >
        {item.name}
      </span>
    </button>
  );
}
