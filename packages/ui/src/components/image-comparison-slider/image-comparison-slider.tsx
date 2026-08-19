"use client";

import type { ChangeEvent, PointerEvent } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { ImageComparisonSliderHandle } from "./image-comparison-slider-handle";
import {
  bracketLabel,
  clampPosition,
  type ComparisonOrientation,
  DEFAULT_POSITION,
  formatPositionLabel,
  positionFromClient,
} from "./lib";

export type { ComparisonOrientation };

export interface ImageComparisonSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  beforeSrcSet?: string;
  afterSrcSet?: string;
  sizes?: string;
  /** Label painted over the before side. @default "BEFORE" */
  beforeLabel?: string;
  /** Label painted over the after side. @default "AFTER" */
  afterLabel?: string;
  /** @default "horizontal" */
  orientation?: ComparisonOrientation;
  /** Handle start position, 0–100. @default 50 */
  initialPosition?: number;
  /** Paint `[ BEFORE ]` / `[ AFTER ]` in the corners. @default true */
  showLabels?: boolean;
  /** Paint `[ NNN / 100 ]` in the corner. @default true */
  showPosition?: boolean;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  fetchPriority?: "auto" | "high" | "low";
  /** Accessible name for the slider. Defaults to “Compare {before} and {after}”. */
  label?: string;
  css?: SystemStyleObject;
  className?: string;
}

const LABEL_CSS: SystemStyleObject = {
  position: "absolute",
  zIndex: "docked",
  color: "white",
  pointerEvents: "none",
  fontFamily: "mono",
  fontSize: "xs",
  letterSpacing: "0.15em",
  userSelect: "none",
  textShadow: "0 0 6px rgba(0, 0, 0, 0.7)",
};

export function ImageComparisonSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  beforeSrcSet,
  afterSrcSet,
  sizes,
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
  orientation = "horizontal",
  initialPosition = DEFAULT_POSITION,
  showLabels = true,
  showPosition = true,
  aspectRatio = "16/9",
  objectFit = "cover",
  fetchPriority = "auto",
  label,
  css: cssProp,
  className,
}: ImageComparisonSliderProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [position, setPosition] = useState(() => clampPosition(initialPosition));
  const [dragging, setDragging] = useState(false);
  const inputId = useId();

  useEffect(() => {
    setPosition(clampPosition(initialPosition));
  }, [initialPosition]);

  const updateFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const frame = frameRef.current;
      if (!frame) {
        return;
      }
      setPosition(positionFromClient(clientX, clientY, frame.getBoundingClientRect(), orientation));
    },
    [orientation],
  );

  function handlePointerDown(event: PointerEvent<HTMLInputElement>) {
    if (event.button !== 0) {
      return;
    }
    draggingRef.current = true;
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    updateFromClient(event.clientX, event.clientY);
  }

  function handlePointerMove(event: PointerEvent<HTMLInputElement>) {
    if (!draggingRef.current) {
      return;
    }
    updateFromClient(event.clientX, event.clientY);
  }

  function stopDragging(event: PointerEvent<HTMLInputElement>) {
    if (!draggingRef.current) {
      return;
    }
    draggingRef.current = false;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (draggingRef.current) {
      return;
    }
    setPosition(clampPosition(Number(event.target.value)));
  }

  if (!beforeSrc || !afterSrc) {
    return null;
  }

  const isHorizontal = orientation === "horizontal";
  const accessibleName = label ?? `Compare ${beforeLabel} and ${afterLabel}`;
  const clipPath = isHorizontal
    ? `inset(0 ${100 - position}% 0 0)`
    : `inset(0 0 ${100 - position}% 0)`;

  return (
    <Box
      ref={frameRef}
      className={className}
      css={{
        position: "relative",
        display: "block",
        overflow: "hidden",
        width: "100%",
        aspectRatio,
        userSelect: "none",
        ...cssProp,
      }}
    >
      <img
        src={afterSrc}
        srcSet={afterSrcSet}
        sizes={afterSrcSet ? sizes : undefined}
        alt={afterAlt}
        draggable={false}
        decoding="async"
        fetchPriority={fetchPriority}
        className={layerClass}
        style={{ objectFit }}
      />

      <Box
        css={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
        style={{ clipPath }}
      >
        <img
          src={beforeSrc}
          srcSet={beforeSrcSet}
          sizes={beforeSrcSet ? sizes : undefined}
          alt={beforeAlt}
          draggable={false}
          decoding="async"
          fetchPriority={fetchPriority}
          className={layerClass}
          style={{ objectFit }}
        />
      </Box>

      <ImageComparisonSliderHandle
        orientation={orientation}
        position={position}
        dragging={dragging}
      />

      {showLabels && (
        <>
          <Box as="span" aria-hidden="true" css={{ ...LABEL_CSS, top: "3", left: "3" }}>
            {bracketLabel(beforeLabel)}
          </Box>
          <Box
            as="span"
            aria-hidden="true"
            css={{
              ...LABEL_CSS,
              ...(isHorizontal ? { top: "3", right: "3" } : { bottom: "3", left: "3" }),
            }}
          >
            {bracketLabel(afterLabel)}
          </Box>
        </>
      )}

      {showPosition && (
        <Box as="span" aria-hidden="true" css={{ ...LABEL_CSS, right: "3", bottom: "3" }}>
          {formatPositionLabel(position)}
        </Box>
      )}

      <input
        id={inputId}
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(position)}
        aria-label={accessibleName}
        aria-orientation={orientation}
        aria-valuetext={`${Math.round(position)} percent ${beforeLabel}`}
        onChange={handleChange}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        className={rangeClass}
        style={
          isHorizontal
            ? { cursor: "ew-resize" }
            : { cursor: "ns-resize", writingMode: "vertical-lr", direction: "rtl" }
        }
      />
    </Box>
  );
}

const layerClass = css({
  position: "absolute",
  inset: 0,
  display: "block",
  width: "100%",
  height: "100%",
  pointerEvents: "none",
});

const rangeClass = css({
  position: "absolute",
  inset: 0,
  zIndex: "docked",
  width: "100%",
  height: "100%",
  margin: 0,
  opacity: 0,
  appearance: "none",
  touchAction: "none",
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "-2px" },
  "&::-webkit-slider-thumb": { width: "2px", height: "100%", appearance: "none" },
  "&::-moz-range-thumb": { width: "2px", height: "100%", border: "none" },
});
