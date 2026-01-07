"use client";

import type { VideoHTMLAttributes } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";
import { CopyrightLabel, type CopyrightPosition } from "../copyright-label";
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
   * @default "inline"
   */
  copyrightPosition?: CopyrightPosition;
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
export const Video = forwardRef<HTMLDivElement, VideoProps>(
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
      copyrightPosition = "inline-white",
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
    const [isLoading, setIsLoading] = useState(true);

    // Check if video is already loaded (e.g., from cache)
    useEffect(() => {
      const video = videoRef.current;
      if (video?.readyState !== undefined && video.readyState >= 2) {
        // HAVE_CURRENT_DATA or better
        setIsLoading(false);
      }
    }, []);

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
            {/* Loading skeleton */}
            <Box
              className={css({
                position: "absolute",
                inset: 0,
                w: "100%",
                h: "100%",
                bg: "linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
                zIndex: 1,
                opacity: isLoading ? 1 : 0,
                transition: "opacity 0.5s ease-in-out",
                pointerEvents: isLoading ? "auto" : "none",
              })}
            />

            <iframe
              src={embedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              className={css({
                position: "absolute",
                inset: 0,
                w: "100%",
                h: "100%",
                border: "none",
                opacity: isLoading ? 0 : 1,
                transition: "opacity 0.5s ease-in-out",
              })}
            />

            {/* Copyright inline white (vertical on right side) */}
            {copyright && copyrightPosition === "inline-white" && (
              <CopyrightLabel text={copyright} position="inline-white" />
            )}

            {/* Copyright overlay (bottom gradient) */}
            {copyright && copyrightPosition === "overlay" && (
              <CopyrightLabel text={copyright} position="overlay" />
            )}

            {/* Copyright inline black */}
            {copyright && copyrightPosition === "inline-black" && (
              <CopyrightLabel text={copyright} position="inline-black" />
            )}
          </Box>

          {/* Copyright below video */}
          {copyright && copyrightPosition === "below" && (
            <CopyrightLabel text={copyright} position="below" />
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
            {/* Loading skeleton */}
            <Box
              className={css({
                position: "absolute",
                inset: 0,
                w: "100%",
                h: "100%",
                bg: "linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
                zIndex: 1,
                opacity: isLoading ? 1 : 0,
                transition: "opacity 0.5s ease-in-out",
                pointerEvents: isLoading ? "auto" : "none",
              })}
            />

            <iframe
              src={embedUrl}
              title="Vimeo video player"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              className={css({
                position: "absolute",
                inset: 0,
                w: "100%",
                h: "100%",
                border: "none",
                opacity: isLoading ? 0 : 1,
                transition: "opacity 0.5s ease-in-out",
              })}
            />

            {/* Copyright inline white (vertical on right side) */}
            {copyright && copyrightPosition === "inline-white" && (
              <CopyrightLabel text={copyright} position="inline-white" />
            )}

            {/* Copyright overlay (bottom gradient) */}
            {copyright && copyrightPosition === "overlay" && (
              <CopyrightLabel text={copyright} position="overlay" />
            )}

            {/* Copyright inline black */}
            {copyright && copyrightPosition === "inline-black" && (
              <CopyrightLabel text={copyright} position="inline-black" />
            )}
          </Box>

          {/* Copyright below video */}
          {copyright && copyrightPosition === "below" && (
            <CopyrightLabel text={copyright} position="below" />
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
            background: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
            ...cssProp,
          }}
          style={{ aspectRatio: ratioValue, ...wrapperStyle }}
        >
          {/* Loading skeleton */}
          <Box
            className={css({
              position: "absolute",
              inset: 0,
              w: "100%",
              h: "100%",
              bg: "linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s ease-in-out infinite",
              zIndex: 1,
              opacity: isLoading ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
              pointerEvents: isLoading ? "auto" : "none",
            })}
          />

          <video
            ref={videoRef}
            src={src}
            poster={poster}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            playsInline
            preload="metadata"
            onLoadedData={() => setIsLoading(false)}
            className={cx(
              css({
                position: "absolute",
                inset: 0,
                w: "100%",
                h: "100%",
                objectFit: "contain",
                opacity: isLoading ? 0 : 1,
                transition: "opacity 0.5s ease-in-out",
              }),
              className,
            )}
            style={style}
            {...props}
          />

          {/* Custom controls */}
          <VideoControls videoRef={videoRef} show={controls} />

          {/* Copyright inline white (vertical on right side) */}
          {copyright && copyrightPosition === "inline-white" && (
            <CopyrightLabel text={copyright} position="inline-white" />
          )}

          {/* Copyright overlay (bottom gradient) */}
          {copyright && copyrightPosition === "overlay" && (
            <CopyrightLabel text={copyright} position="overlay" />
          )}

          {/* Copyright inline black */}
          {copyright && copyrightPosition === "inline-black" && (
            <CopyrightLabel text={copyright} position="inline-black" />
          )}
        </Box>

        {/* Copyright below video */}
        {copyright && copyrightPosition === "below" && (
          <CopyrightLabel text={copyright} position="below" />
        )}
      </>
    );
  },
);

Video.displayName = "Video";
