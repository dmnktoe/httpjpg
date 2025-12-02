"use client";

import type { VideoHTMLAttributes } from "react";
import { forwardRef, useRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";
import { VideoControls } from "./video-controls";

/**
 * Video source types
 */
export type VideoSource = "native" | "youtube" | "vimeo";

/**
 * Video component props
 */
export interface VideoProps
  extends Omit<VideoHTMLAttributes<HTMLVideoElement>, "css" | "src"> {
  /**
   * Video source URL or ID
   * - For native: direct video URL
   * - For YouTube: video ID or full URL
   * - For Vimeo: video ID or full URL
   */
  src: string;
  /**
   * Video source type
   * @default "native"
   */
  source?: VideoSource;
  /**
   * Poster image URL (only for native videos)
   */
  poster?: string;
  /**
   * Show custom controls
   * @default true
   */
  controls?: boolean;
  /**
   * Autoplay video
   * @default false
   */
  autoPlay?: boolean;
  /**
   * Loop video
   * @default false
   */
  loop?: boolean;
  /**
   * Mute video
   * @default false
   */
  muted?: boolean;
  /**
   * Aspect ratio preset or custom value
   * @default "16/9"
   */
  aspectRatio?: "1/1" | "4/3" | "16/9" | "21/9" | "9/16" | number;
  /**
   * Copyright text
   */
  copyright?: string;
  /**
   * Copyright position
   * @default "below"
   */
  copyrightPosition?: "below" | "overlay";
  /**
   * Custom styles for the wrapper
   */
  wrapperStyle?: React.CSSProperties;
  /**
   * Custom class name for the wrapper
   */
  wrapperClassName?: string;
  /**
   * Custom styles using Panda CSS SystemStyleObject
   */
  css?: SystemStyleObject;
}

/**
 * Extract YouTube video ID from URL
 */
function getYouTubeId(url: string): string {
  if (url.length === 11 && !url.includes("/") && !url.includes("?")) {
    return url;
  }
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : url;
}

/**
 * Extract Vimeo video ID from URL
 */
function getVimeoId(url: string): string {
  if (/^\d+$/.test(url)) {
    return url;
  }
  const regExp = /vimeo\.com\/(?:video\/)?(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : url;
}

/**
 * Video component - Multi-source video player with custom controls
 *
 * A versatile video component that supports native HTML5 videos, YouTube embeds,
 * and Vimeo embeds. Features custom controls, copyright display, and responsive
 * aspect ratios using Panda CSS.
 *
 * **Supported Sources:**
 * - Native HTML5 videos with custom controls (play/pause, seek, volume)
 * - YouTube embeds with configurable player options
 * - Vimeo embeds with configurable player options
 *
 * **Features:**
 * - 🎬 Custom video controls with progress bar and volume
 * - 📐 Responsive aspect ratios (16/9, 4/3, 1/1, 21/9, 9/16, custom)
 * - ©️ Copyright text support (below or overlay)
 * - 🎨 Fully styled with Panda CSS
 * - ♿️ Accessible controls with ARIA labels
 *
 * @example
 * ```tsx
 * // Native HTML5 video with custom controls
 * <video
 *   src="https://example.com/video.mp4"
 *   poster="https://example.com/poster.jpg"
 *   controls
 *   copyright="© 2025 Creator Name"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // YouTube embed
 * <video
 *   src="dQw4w9WgXcQ"
 *   source="youtube"
 *   aspectRatio="16/9"
 *   controls
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Vimeo embed with autoplay
 * <video
 *   src="123456789"
 *   source="vimeo"
 *   autoPlay
 *   muted
 *   loop
 * />
 * ```
 */
export const video = forwardRef<HTMLDivElement, VideoProps>(
  (
    {
      src,
      source = "native",
      poster,
      controls = true,
      autoPlay = false,
      loop = false,
      muted = false,
      aspectRatio = "16/9",
      copyright,
      copyrightPosition = "below",
      wrapperStyle,
      wrapperClassName,
      className,
      style,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const showCopyrightOverlay = copyright && copyrightPosition === "overlay";

    // Render YouTube embed
    if (source === "youtube") {
      const videoId = getYouTubeId(src);
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`;

      const ratioValue =
        typeof aspectRatio === "number" ? `${aspectRatio}` : aspectRatio;

      return (
        <>
          <Box
            ref={ref}
            className={cx(wrapperClassName)}
            css={{
              position: "relative",
              w: "100%",
              overflow: "hidden",
              ...cssProp,
            }}
            style={{ aspectRatio: ratioValue, ...wrapperStyle }}
          >
            <iframe
              src={embedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={css({
                position: "absolute",
                inset: 0,
                w: "100%",
                h: "100%",
                border: "none",
              })}
            />

            {showCopyrightOverlay && (
              <Box
                css={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background:
                    "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
                  p: "1rem",
                  fontFamily: "mono",
                  fontSize: "sm",
                  opacity: 0.7,
                  color: "white",
                  boxSizing: "border-box",
                  pointerEvents: "none",
                }}
              >
                {copyright}
              </Box>
            )}
          </Box>

          {copyright && copyrightPosition === "below" && (
            <Box
              css={{
                fontFamily: "mono",
                fontSize: "sm",
                opacity: 0.7,
                p: "0.5rem 0",
                color: "currentColor",
              }}
            >
              {copyright}
            </Box>
          )}
        </>
      );
    }

    // Render Vimeo embed
    if (source === "vimeo") {
      const videoId = getVimeoId(src);
      const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=${autoPlay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`;

      const ratioValue =
        typeof aspectRatio === "number" ? `${aspectRatio}` : aspectRatio;

      return (
        <>
          <Box
            ref={ref}
            className={cx(wrapperClassName)}
            css={{
              position: "relative",
              w: "100%",
              overflow: "hidden",
              ...cssProp,
            }}
            style={{ aspectRatio: ratioValue, ...wrapperStyle }}
          >
            <iframe
              src={embedUrl}
              title="Vimeo video player"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className={css({
                position: "absolute",
                inset: 0,
                w: "100%",
                h: "100%",
                border: "none",
              })}
            />

            {showCopyrightOverlay && (
              <Box
                css={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background:
                    "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
                  p: "1rem",
                  fontFamily: "mono",
                  fontSize: "sm",
                  opacity: 0.7,
                  color: "white",
                  boxSizing: "border-box",
                  pointerEvents: "none",
                }}
              >
                {copyright}
              </Box>
            )}
          </Box>

          {copyright && copyrightPosition === "below" && (
            <Box
              css={{
                fontFamily: "mono",
                fontSize: "sm",
                opacity: 0.7,
                p: "0.5rem 0",
                color: "currentColor",
              }}
            >
              {copyright}
            </Box>
          )}
        </>
      );
    }

    // Render native video with custom controls
    const ratioValue =
      typeof aspectRatio === "number" ? `${aspectRatio}` : aspectRatio;

    return (
      <>
        <Box
          ref={ref}
          className={cx(wrapperClassName)}
          css={{
            position: "relative",
            w: "100%",
            overflow: "hidden",
            background: "black",
            ...cssProp,
          }}
          style={{ aspectRatio: ratioValue, ...wrapperStyle }}
        >
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            playsInline
            className={cx(
              css({
                position: "absolute",
                inset: 0,
                w: "100%",
                h: "100%",
                objectFit: "contain",
              }),
              className,
            )}
            style={style}
            {...props}
          />

          {/* Custom controls */}
          <VideoControls videoRef={videoRef} show={controls} />

          {showCopyrightOverlay && (
            <Box
              css={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background:
                  "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
                p: "1rem",
                fontFamily: "mono",
                fontSize: "sm",
                opacity: 0.7,
                color: "white",
                boxSizing: "border-box",
                pointerEvents: "none",
              }}
            >
              {copyright}
            </Box>
          )}
        </Box>

        {copyright && copyrightPosition === "below" && (
          <Box
            css={{
              fontFamily: "mono",
              fontSize: "sm",
              opacity: 0.7,
              p: "0.5rem 0",
              color: "currentColor",
            }}
          >
            {copyright}
          </Box>
        )}
      </>
    );
  },
);

video.displayName = "video";
