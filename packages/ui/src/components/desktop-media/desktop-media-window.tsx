"use client";

import { css } from "styled-system/css";

import type { ScatterPosition } from "../../lib/desktop-scatter";
import { useDesktopDrag } from "../../lib/use-desktop-drag";
import { Image } from "../image/image";
import { Video } from "../video/video";
import {
  DESKTOP_MEDIA_BODY_MAX_HEIGHT,
  DESKTOP_MEDIA_VIEWPORT_MARGIN_PX,
  type DesktopMediaItem,
  type DesktopMediaKind,
  desktopMediaAspectRatio,
  desktopMediaLayoutRatio,
  desktopMediaSizesAttr,
  desktopMediaWindowHeight,
  desktopMediaWindowWidth,
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
  const layoutRatio = desktopMediaLayoutRatio(item, kind);
  const width = desktopMediaWindowWidth(frameWidth, layoutRatio);
  // No aspect ratio means a video of unknown size: reserve the full height cap for it.
  const height = desktopMediaWindowHeight(frameWidth, aspectRatio ? layoutRatio : undefined);
  const margin = `${DESKTOP_MEDIA_VIEWPORT_MARGIN_PX}px`;

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
        overflow: "hidden",
      })}
      style={{
        zIndex: stackingOrder,
        width,
        outline: selected ? "1px solid currentColor" : undefined,
        cursor: dragging ? "grabbing" : undefined,
        ...(offset
          ? { left: offset.x, top: offset.y }
          : {
              left: `clamp(${margin}, ${position.left}%, calc(100vw - ${width} - ${margin}))`,
              top: `clamp(${margin}, ${position.top}%, calc(100vh - ${height} - ${margin}))`,
            }),
      }}
    >
      <div
        data-desktop-titlebar=""
        className={css({
          display: "flex",
          alignItems: "center",
          flexShrink: "0",
          gap: "2",
          // Fixed, not min: `lib.ts` subtracts this height to size the window.
          h: "8",
          px: "2",
          fontFamily: "mono",
          fontSize: "xs",
          lineHeight: "none",
          letterSpacing: "wider",
          borderBottomColor: "pageBorder",
          borderBottomStyle: "solid",
          borderBottomWidth: "1px",
          cursor: dragging ? "grabbing" : "grab",
          // Only the handle opts out of touch gestures; a swipe on the media still scrolls the page.
          touchAction: "none",
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
          position: "relative",
          pointerEvents: kind === "video" ? "auto" : "none",
          overflow: "hidden",
        })}
        // Inline, and the media fills this box: a `<w>/<h>` ratio per asset is
        // not statically extractable, so the components' own ratio class is dead.
        style={aspectRatio ? { aspectRatio } : undefined}
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
            css={{
              backgroundColor: "black",
              backgroundImage: "none",
              ...(aspectRatio && { position: "absolute", inset: "0", h: "100%" }),
            }}
            // Unknown size: the window could not be narrowed for it, so letterbox instead.
            style={aspectRatio ? undefined : { maxHeight: `calc${DESKTOP_MEDIA_BODY_MAX_HEIGHT}` }}
          />
        ) : (
          <Image
            src={item.src}
            srcSet={item.srcSet}
            sizes={item.sizes ?? desktopMediaSizesAttr(frameWidth)}
            alt={alt}
            objectFit="contain"
            draggable={false}
            css={{ position: "absolute", inset: "0", h: "100%" }}
          />
        )}
      </div>
    </figure>
  );
}

interface KindMarkProps {
  kind: DesktopMediaKind;
}

function KindMark({ kind }: KindMarkProps) {
  return (
    <span aria-hidden="true" className={css({ flexShrink: "0", opacity: 0.55 })}>
      {kind === "video" ? "▶" : "▣"}
    </span>
  );
}
