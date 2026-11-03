"use client";

import type { ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { aspectOf, DEVICE_FRAMES, type DeviceFrameName, type DeviceFramePreset } from "./devices";
import { clipPathForQuad, matrix3dForQuad, scaleQuad, screenSize } from "./lib";

export interface DeviceFrameProps {
  /** A preset name, or a custom preset for a one-off device. */
  device: DeviceFrameName | DeviceFramePreset;
  /**
   * The media to show on the screen. It is laid out in a flat rectangle with
   * the screen's aspect ratio and then projected onto the screen, so give it
   * `width: 100%` and the matching aspect (e.g. `Video` with `aspectRatio`).
   */
  children: ReactNode;
  /** Keep the photo's own screen reflections over the media. @default true */
  gloss?: boolean;
  css?: SystemStyleObject;
  className?: string;
}

/**
 * Puts media "on the screen" of a product photo: the cut-out device is the
 * frame, the screen quad is clipped out and the media is projected into it
 * with a four-point homography. No tilt, no 3D; that is `HoloCard`'s job.
 */
export const DeviceFrame = forwardRef<HTMLDivElement, DeviceFrameProps>(function DeviceFrame(
  { device, children, gloss = true, css: cssProp, className },
  ref,
) {
  const preset: DeviceFramePreset = typeof device === "string" ? DEVICE_FRAMES[device] : device;
  const rootRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const measure = () => setScale(root.clientWidth / preset.width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [preset.width]);

  const screen = screenSize(preset.screen, aspectOf(preset.screenAspect));
  const mediaStyle =
    scale === null
      ? undefined
      : {
          width: `${screen.width * scale}px`,
          height: `${screen.height * scale}px`,
          transform: matrix3dForQuad(
            screen.width * scale,
            screen.height * scale,
            scaleQuad(preset.screen, scale),
          ),
        };

  return (
    <Box
      ref={(node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={cx(ROOT_CLASS, cssProp && css(cssProp), className)}
      style={{ aspectRatio: `${preset.width} / ${preset.height}` }}
      data-device-frame={typeof device === "string" ? device : "custom"}
    >
      <img src={preset.src} alt={preset.name} className={BODY_CLASS} decoding="async" />
      <div
        className={SCREEN_CLASS}
        style={{
          clipPath: clipPathForQuad(preset.screen, preset.width, preset.height),
          visibility: scale === null ? "hidden" : "visible",
        }}
      >
        <div className={MEDIA_CLASS} style={mediaStyle} data-device-screen="">
          {children}
        </div>
        {gloss && (
          <img
            src={preset.src}
            alt=""
            aria-hidden="true"
            className={GLOSS_CLASS}
            decoding="async"
          />
        )}
      </div>
    </Box>
  );
});

DeviceFrame.displayName = "DeviceFrame";

const ROOT_CLASS = css({
  position: "relative",
  width: "100%",
});

const BODY_CLASS = css({
  position: "absolute",
  inset: 0,
  display: "block",
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  userSelect: "none",
});

const SCREEN_CLASS = css({
  position: "absolute",
  inset: 0,
  bg: "black",
});

const MEDIA_CLASS = css({
  position: "absolute",
  top: 0,
  left: 0,
  transformOrigin: "0 0",
  overflow: "hidden",
});

/** The photo's own screen highlights, screened over the media so the glass still reads. */
const GLOSS_CLASS = css({
  position: "absolute",
  inset: 0,
  display: "block",
  width: "100%",
  height: "100%",
  opacity: 0.5,
  mixBlendMode: "screen",
  pointerEvents: "none",
  userSelect: "none",
});
