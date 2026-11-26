"use client";

import { Box } from "@httpjpg/ui";
import { type CSSProperties, type PointerEvent, useRef } from "react";

import { cropPreviewStyle, formatRatio, panCrop } from "@/lib/feed/compose/crop";
import { type ComposerMedia, canCrop } from "@/lib/feed/compose/media";

export interface ComposerStageProps {
  media: ComposerMedia | undefined;
  /** The post's first file: it sets the frame of an `original` post. */
  first: ComposerMedia | undefined;
  format: string;
  onPan: (offset: { offsetX: number; offsetY: number }) => void;
}

interface Press {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

export function ComposerStage({ media, first, format, onPan }: ComposerStageProps) {
  const pressRef = useRef<Press | null>(null);
  const ratio = formatRatio(format, first);
  const isMovable = media ? canCrop(media, format) : false;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!media || !isMovable || event.button !== 0) {
      return;
    }
    pressRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: media.offsetX,
      offsetY: media.offsetY,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    if (!press || !media || !(event.buttons & 1)) {
      pressRef.current = null;
      return;
    }
    const box = event.currentTarget.getBoundingClientRect();
    onPan(
      panCrop(
        {
          width: media.width as number,
          height: media.height as number,
          ratio,
          zoom: media.zoom,
          offsetX: press.offsetX,
          offsetY: press.offsetY,
        },
        (event.clientX - press.x) / (box.width || 1),
        (event.clientY - press.y) / (box.height || 1),
      ),
    );
  };

  const handlePointerEnd = () => {
    pressRef.current = null;
  };

  return (
    <Box
      data-composer-stage=""
      data-movable={isMovable || undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      css={{
        position: "relative",
        aspectRatio: "var(--stage-ratio)",
        w: "full",
        bg: "pageBg",
        border: "1px solid",
        borderColor: "pageFg",
        userSelect: "none",
        touchAction: "none",
        overflow: "hidden",
        "&[data-movable]": { cursor: "grab" },
      }}
      style={{ "--stage-ratio": String(ratio) } as CSSProperties}
    >
      {media ? (
        <StageMedia media={media} ratio={ratio} isMovable={isMovable} />
      ) : (
        <Box
          css={{
            position: "absolute",
            inset: "0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: "4",
            opacity: 0.6,
            fontFamily: "mono",
            fontSize: "sm",
            textAlign: "center",
          }}
        >
          drop pictures or videos here ･ﾟ⋆
        </Box>
      )}
    </Box>
  );
}

function StageMedia({
  media,
  ratio,
  isMovable,
}: {
  media: ComposerMedia;
  ratio: number;
  isMovable: boolean;
}) {
  const fill: CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: media.fit,
  };
  if (media.kind === "video") {
    return <video src={media.previewUrl} muted loop playsInline autoPlay style={fill} />;
  }
  const style: CSSProperties = isMovable
    ? {
        position: "absolute",
        maxWidth: "none",
        ...cropPreviewStyle({
          width: media.width as number,
          height: media.height as number,
          ratio,
          zoom: media.zoom,
          offsetX: media.offsetX,
          offsetY: media.offsetY,
        }),
      }
    : fill;
  return <img src={media.previewUrl} alt={media.alt} draggable={false} style={style} />;
}
