"use client";

import { css } from "styled-system/css";

import type { ScatterPosition } from "../../lib/desktop-scatter";
import { useDesktopDrag } from "../../lib/use-desktop-drag";
import { Image } from "../image/image";
import { Video } from "../video/video";
import {
  type DesktopMediaItem,
  type DesktopMediaKind,
  desktopMediaAspectRatio,
  desktopMediaSizesAttr,
  resolveDesktopMediaFrameWidth,
  resolveDesktopMediaKind,
} from "./lib";

export interface DesktopMediaWindowProps {
  item: DesktopMediaItem;
  position: ScatterPosition;
  selected: boolean;
  stackingOrder: number;
  onSelect: () => void;
}

export function DesktopMediaWindow({
  item,
  position,
  selected,
  stackingOrder,
  onSelect,
}: DesktopMediaWindowProps) {
  const kind = resolveDesktopMediaKind(item);
  const { offset, dragging, handlers } = useDesktopDrag<HTMLElement>({
    onSelect,
    noDragSelector: "[data-desktop-no-drag]",
  });

  if (!kind) {
    return null;
  }

  const aspectRatio = desktopMediaAspectRatio(item, kind);
  const alt = item.alt?.trim() || item.name;
  const frameWidth = resolveDesktopMediaFrameWidth(item.width);

  return (
    <figure
      aria-label={item.name}
      data-draggable="true"
      data-desktop-media-item=""
      data-media-kind={kind}
      data-frame-width={String(frameWidth)}
      data-selected={selected ? "" : undefined}
      {...handlers}
      className={css({
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        color: "pageFg",
        backgroundColor: "pageBg",
        borderColor: "pageBorder",
        borderStyle: "solid",
        borderWidth: "1px",
        pointerEvents: "auto",
        userSelect: "none",
        touchAction: "none",
        overflow: "hidden",
        _focusVisible: { outline: "2px solid", outlineColor: "pageFg", outlineOffset: "2px" },
      })}
      style={{
        zIndex: stackingOrder,
        width: `min(${frameWidth}px, calc(100vw - 16px))`,
        maxHeight: "min(72vh, 800px)",
        outline: selected ? "1px solid currentColor" : undefined,
        cursor: dragging ? "grabbing" : undefined,
        ...(offset
          ? { left: offset.x, top: offset.y }
          : {
              left: `clamp(8px, ${position.left}%, calc(100vw - min(${frameWidth}px, calc(100vw - 16px)) - 8px))`,
              top: `clamp(8px, ${position.top}%, calc(100vh - 120px))`,
            }),
      }}
    >
      <div
        data-desktop-titlebar=""
        className={css({
          display: "flex",
          alignItems: "center",
          gap: "2",
          minH: "8",
          px: "2",
          py: "1",
          fontFamily: "mono",
          fontSize: "xs",
          lineHeight: "none",
          letterSpacing: "wider",
          borderBottomColor: "pageBorder",
          borderBottomStyle: "solid",
          borderBottomWidth: "1px",
          cursor: dragging ? "grabbing" : "grab",
        })}
      >
        <KindMark kind={kind} />
        <span
          className={css({
            minW: "0",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
          })}
        >
          {item.name}
        </span>
      </div>
      <div
        data-desktop-no-drag={kind === "video" ? "" : undefined}
        className={css({
          minH: "0",
          pointerEvents: kind === "video" ? "auto" : "none",
          overflow: "hidden",
        })}
      >
        {kind === "video" ? (
          <Video
            src={item.src}
            source="native"
            poster={item.poster}
            aspectRatio={aspectRatio}
            mediaWidth={item.mediaWidth}
            mediaHeight={item.mediaHeight}
            objectFit="contain"
            controls
            css={{ backgroundColor: "#000", backgroundImage: "none" }}
          />
        ) : (
          <Image
            src={item.src}
            srcSet={item.srcSet}
            sizes={item.sizes ?? desktopMediaSizesAttr(frameWidth)}
            alt={alt}
            aspectRatio={aspectRatio}
            objectFit="contain"
            draggable={false}
          />
        )}
      </div>
    </figure>
  );
}

function KindMark({ kind }: { kind: DesktopMediaKind }) {
  return (
    <span aria-hidden="true" className={css({ flexShrink: "0", opacity: 0.55 })}>
      {kind === "video" ? "▶" : "▣"}
    </span>
  );
}
