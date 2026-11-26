"use client";

import { Box } from "@httpjpg/ui";
import { type ChangeEvent, type DragEvent, useRef } from "react";
import { css } from "styled-system/css";

import type { ComposerMedia } from "@/lib/feed/compose/media";

import { buttonClass } from "./composer-styles";

export interface ComposerStripProps {
  media: ComposerMedia[];
  selectedKey: string | undefined;
  onSelect: (key: string) => void;
  onMove: (from: number, to: number) => void;
  onRemove: (key: string) => void;
  onAddFiles: (files: File[]) => void;
}

const REORDER_TYPE = "application/x-httpjpg-media";

const thumbClass = css({
  position: "relative",
  boxSizing: "border-box",
  display: "block",
  aspectRatio: "1",
  w: "full",
  border: "1px solid",
  borderColor: "pageBorder",
  cursor: "pointer",
  overflow: "hidden",
  all: "unset",
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
  "&[aria-pressed=true]": { outline: "2px solid", outlineColor: "pageFg", outlineOffset: "1px" },
});

const toolClass = css({
  flex: "1",
  py: "1",
  fontFamily: "mono",
  fontSize: "xs",
  lineHeight: 1,
  textAlign: "center",
  cursor: "pointer",
  all: "unset",
  _hover: { color: "pageBg", bg: "pageFg" },
  _disabled: { opacity: 0.3, cursor: "default" },
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500" },
});

export function ComposerStrip({
  media,
  selectedKey,
  onSelect,
  onMove,
  onRemove,
  onAddFiles,
}: ComposerStripProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    onAddFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLIElement>, to: number) => {
    const from = Number(event.dataTransfer.getData(REORDER_TYPE));
    if (event.dataTransfer.types.includes(REORDER_TYPE) && Number.isInteger(from)) {
      event.preventDefault();
      event.stopPropagation();
      onMove(from, to);
    }
  };

  return (
    <Box
      as="ul"
      aria-label="Files of the post"
      css={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(4.5rem, 1fr))",
        gap: "2",
        m: 0,
        p: 0,
        listStyle: "none",
      }}
    >
      {media.map((item, index) => (
        <Box
          as="li"
          key={item.key}
          draggable
          onDragStart={(event: DragEvent<HTMLLIElement>) => {
            event.dataTransfer.setData(REORDER_TYPE, String(index));
            event.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(event: DragEvent<HTMLLIElement>) => {
            if (event.dataTransfer.types.includes(REORDER_TYPE)) {
              event.preventDefault();
            }
          }}
          onDrop={(event: DragEvent<HTMLLIElement>) => handleDrop(event, index)}
          css={{ display: "flex", flexDirection: "column", minW: 0 }}
        >
          <button
            type="button"
            aria-label={`File ${index + 1}${item.alt ? `: ${item.alt}` : ""}`}
            aria-pressed={item.key === selectedKey}
            className={thumbClass}
            onClick={() => onSelect(item.key)}
          >
            {item.kind === "video" ? (
              <video
                src={item.previewUrl}
                muted
                playsInline
                preload="metadata"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <img
                src={item.previewUrl}
                alt=""
                draggable={false}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </button>
          <Box
            css={{
              display: "flex",
              border: "1px solid",
              borderColor: "pageBorder",
              borderTop: "none",
            }}
          >
            <button
              type="button"
              aria-label={`Move file ${index + 1} earlier`}
              className={toolClass}
              disabled={index === 0}
              onClick={() => onMove(index, index - 1)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label={`Remove file ${index + 1}`}
              className={toolClass}
              onClick={() => onRemove(item.key)}
            >
              ╳
            </button>
            <button
              type="button"
              aria-label={`Move file ${index + 1} later`}
              className={toolClass}
              disabled={index === media.length - 1}
              onClick={() => onMove(index, index + 1)}
            >
              →
            </button>
          </Box>
        </Box>
      ))}
      <Box as="li" css={{ display: "flex" }}>
        <button
          type="button"
          className={buttonClass}
          style={{ width: "100%", textAlign: "center" }}
          onClick={() => inputRef.current?.click()}
        >
          [ + ]
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/mp4,video/quicktime,video/webm"
          multiple
          hidden
          aria-label="Add pictures or videos"
          onChange={handleFiles}
        />
      </Box>
    </Box>
  );
}
