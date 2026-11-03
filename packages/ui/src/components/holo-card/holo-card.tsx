"use client";

import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { CopyrightLabel } from "../copyright-label/copyright-label";
import {
  createHoloRenderer,
  type HoloFoil,
  type HoloLayerKind,
  type HoloRenderer,
  type HoloSparkle,
  seedFromString,
} from "./holo-shader";
import { DEFAULT_INTENSITY, DEFAULT_MAX_TILT, type HoloVariant } from "./lib";
import { useHoloTilt } from "./use-holo-tilt";

export interface HoloCardProps {
  src: string;
  alt: string;
  /**
   * Same-origin (or CORS-enabled) copy of `src` for the WebGL texture. The
   * `<img>` keeps using `src`; a cross-origin texture without CORS headers
   * taints the canvas, so pass a proxied URL when the CDN sends none.
   * @default src
   */
  textureSrc?: string;
  srcSet?: string;
  sizes?: string;
  /**
   * `card` is a framed trading card with rounded corners; `disc` is a CD with
   * a centre hole and diffraction fans. @default "card"
   */
  variant?: HoloVariant;
  /** CSS aspect ratio of the card. Discs are always square. @default "5/7" (a real trading card) */
  aspectRatio?: string;
  /** Foil strength, 0–1. @default 0.8 */
  intensity?: number;
  /** Max rotation on either axis in degrees. @default 18 */
  maxTilt?: number;
  /** Drift slowly while nothing touches the card. @default true */
  idle?: boolean;
  /** Follow the phone's gyroscope (iOS asks via a tap). @default true */
  gyro?: boolean;
  /** Frame width as a fraction of the shorter side (card only). @default 0.045 */
  frame?: number;
  /** Corner radius in px (card only). @default 14 */
  radius?: number;
  /**
   * Optional cut-out (PNG/WebP with alpha, same framing as `src`) that floats
   * in front of the photo with its own parallax, shadow and rainbow fringe.
   */
  foregroundSrc?: string;
  /** Parallax strength: 0 flat, 1 default, 2 deep. @default 1 */
  depth?: number;
  /**
   * Optional effects layer (alpha) rendered on the overhang frame, i.e. the
   * card plus `OVERSCAN` on every side, so shards can stick out past the edge.
   */
  effectsSrc?: string;
  /** Optional greyscale depth map (white = far, same framing as `src`) for per-pixel parallax. */
  depthSrc?: string;
  /** Frame foil: pastel silver (Galagladi) or dark oil-slick swirl (Mew). @default "silver" */
  foil?: HoloFoil;
  /** Twinkling sparkles over the art. @default "stars" */
  sparkle?: HoloSparkle;
  copyright?: string;
  /** Asset source/credit, shown as a second line below the copyright. */
  copyrightSource?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "auto" | "high" | "low";
  /** Slotted below the card (e.g. caption). */
  children?: ReactNode;
  css?: SystemStyleObject;
  className?: string;
}

const DEFAULT_FRAME = 0.045;
const DEFAULT_RADIUS = 14;
const MAX_DPR = 2;
/** Canvas overhang per side so flares and arcs can spill past the card. */
const OVERSCAN = 0.18;

export const HoloCard = forwardRef<HTMLDivElement, HoloCardProps>(function HoloCard(
  {
    src,
    alt,
    textureSrc,
    srcSet,
    sizes,
    variant = "card",
    aspectRatio = "5/7",
    intensity = DEFAULT_INTENSITY,
    maxTilt = DEFAULT_MAX_TILT,
    idle = true,
    gyro = true,
    frame = DEFAULT_FRAME,
    radius = DEFAULT_RADIUS,
    foregroundSrc,
    depth = 1,
    effectsSrc,
    depthSrc,
    foil = "silver",
    sparkle = "stars",
    copyright,
    copyrightSource,
    loading = "lazy",
    fetchPriority = "auto",
    children,
    css: cssProp,
    className,
  },
  ref,
) {
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<HoloRenderer | null>(null);
  const [isFoilReady, setIsFoilReady] = useState(false);
  // Bumped when the GL context comes back so the renderer effect re-runs.
  const [generation, setGeneration] = useState(0);

  const {
    ref: rotatorRef,
    needsGyroPermission,
    requestGyro,
  } = useHoloTilt<HTMLDivElement>({
    maxTilt,
    intensity,
    idle,
    gyro,
    disabled: Boolean(prefersReducedMotion),
    onFrame: (state, time) => rendererRef.current?.render(state, time),
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = rotatorRef.current;
    if (!canvas || !stage || !src) {
      return;
    }

    let renderer: HoloRenderer | null = null;
    try {
      renderer = createHoloRenderer(canvas, {
        variant,
        intensity,
        frame,
        radius,
        maxTilt,
        depth: Math.max(0, depth),
        overscan: OVERSCAN,
        foil,
        sparkle,
        seed: seedFromString(src),
      });
    } catch (error) {
      console.warn("HoloCard: falling back to the plain image", error);
    }
    if (!renderer) {
      return;
    }
    rendererRef.current = renderer;

    let cancelled = false;
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      if (cancelled) {
        return;
      }
      renderer.setImage(image);
      setIsFoilReady(true);
    };
    image.onerror = () => {
      if (!cancelled) {
        setIsFoilReady(false);
      }
    };
    image.src = textureSrc || src;

    const layers: Array<[HoloLayerKind, string | undefined]> = [
      ["foreground", foregroundSrc],
      ["effects", effectsSrc],
      ["depth", depthSrc],
    ];
    for (const [kind, layerSrc] of layers) {
      if (!layerSrc) {
        continue;
      }
      const layer = new window.Image();
      layer.crossOrigin = "anonymous";
      layer.decoding = "async";
      layer.onload = () => {
        if (!cancelled) {
          renderer.setLayer(kind, layer);
        }
      };
      layer.src = layerSrc;
    }

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const grow = 1 + 2 * OVERSCAN;
      renderer.resize(
        rect.width * grow,
        rect.height * grow,
        Math.min(window.devicePixelRatio || 1, MAX_DPR),
      );
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);

    const handleLost = (event: Event) => {
      event.preventDefault();
      setIsFoilReady(false);
    };
    const handleRestored = () => setGeneration((n) => n + 1);
    canvas.addEventListener("webglcontextlost", handleLost);
    canvas.addEventListener("webglcontextrestored", handleRestored);

    return () => {
      cancelled = true;
      observer.disconnect();
      canvas.removeEventListener("webglcontextlost", handleLost);
      canvas.removeEventListener("webglcontextrestored", handleRestored);
      rendererRef.current = null;
      renderer.dispose();
      setIsFoilReady(false);
    };
  }, [
    src,
    textureSrc,
    foregroundSrc,
    effectsSrc,
    depthSrc,
    depth,
    foil,
    sparkle,
    variant,
    intensity,
    frame,
    radius,
    maxTilt,
    generation,
    rotatorRef,
  ]);

  const isDisc = variant === "disc";
  const cornerRadius = isDisc ? "9999px" : `${radius}px`;

  return (
    <Box
      ref={ref}
      className={cx(cssProp && css(cssProp), className)}
      css={{ position: "relative" }}
      data-holo-variant={variant}
      data-holo-ready={isFoilReady ? "true" : "false"}
    >
      <div className={STAGE_CLASS}>
        <div
          ref={rotatorRef}
          className={ROTATOR_CLASS}
          style={{ borderRadius: cornerRadius, aspectRatio: isDisc ? "1 / 1" : aspectRatio }}
        >
          <div
            className={cx(IMAGE_WRAP_CLASS, isDisc && DISC_WRAP_CLASS)}
            style={{
              borderRadius: cornerRadius,
              padding: isDisc ? 0 : `${frame * 100}%`,
              opacity: isFoilReady ? 0 : 1,
            }}
          >
            <img
              src={src}
              srcSet={srcSet}
              sizes={sizes}
              alt={alt}
              loading={loading}
              fetchPriority={fetchPriority}
              decoding="async"
              className={IMAGE_CLASS}
              style={{ borderRadius: isDisc ? "9999px" : `${Math.max(radius - 4, 2)}px` }}
            />
          </div>
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={CANVAS_CLASS}
            style={{
              visibility: isFoilReady ? "visible" : "hidden",
              inset: `${-OVERSCAN * 100}%`,
            }}
          />
        </div>
      </div>
      {needsGyroPermission && (
        <button type="button" className={HINT_CLASS} onClick={() => void requestGyro()}>
          [ tap to tilt ]
        </button>
      )}
      <CopyrightLabel text={copyright} source={copyrightSource} position="below" />
      {children}
    </Box>
  );
});

HoloCard.displayName = "HoloCard";

const STAGE_CLASS = css({
  perspective: "1000px",
  // Pointer events land on the rotator so the tilt tracks the visible card.
  touchAction: "pan-y",
});

const ROTATOR_CLASS = css({
  position: "relative",
  width: "100%",
  filter:
    "drop-shadow(calc(var(--holo-ry, 0) * -0.6px) calc(var(--holo-rx, 0) * 0.6px + 14px) 26px rgba(0, 0, 0, 0.4))",
  transform: "rotateX(calc(var(--holo-rx, 0) * 1deg)) rotateY(calc(var(--holo-ry, 0) * 1deg))",
  willChange: "transform",
  cursor: "grab",
  _motionReduce: { willChange: "auto" },
});

const IMAGE_WRAP_CLASS = css({
  position: "absolute",
  inset: 0,
  bg: "neutral.300",
  transition: "opacity 0.3s ease-in-out",
  overflow: "hidden",
});

const DISC_WRAP_CLASS = css({
  bg: "transparent",
  WebkitMaskImage: "radial-gradient(circle at center, transparent 0 7.4%, #000 7.5%)",
  maskImage: "radial-gradient(circle at center, transparent 0 7.4%, #000 7.5%)",
});

const IMAGE_CLASS = css({
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const CANVAS_CLASS = css({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
});

const HINT_CLASS = css({
  display: "block",
  mx: "auto",
  mt: 2,
  p: 0,
  color: "pageMuted",
  fontFamily: "mono",
  fontSize: "xs",
  letterSpacing: "wider",
  bg: "transparent",
  border: "none",
  cursor: "pointer",
  _hover: { color: "pageFg" },
});
