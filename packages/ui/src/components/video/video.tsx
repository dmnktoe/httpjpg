"use client";

import type { VideoHTMLAttributes } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

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
   * Aspect ratio (e.g., "16/9", "4/3", "1/1")
   * @default "16/9"
   */
  aspectRatio?: string;
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
 * Video component with custom controls and multiple source support
 *
 * Supports:
 * - Native HTML5 videos with custom controls
 * - YouTube embeds
 * - Vimeo embeds
 * - Copyright text
 * - Aspect ratio control
 * - Fully styled with Panda CSS
 *
 * @example
 * ```tsx
 * // Native video with custom controls
 * <video
 *   src="https://example.com/video.mp4"
 *   poster="https://example.com/poster.jpg"
 *   copyright="© 2025 Creator Name"
 * />
 *
 * // YouTube video
 * <video
 *   src="dQw4w9WgXcQ"
 *   source="youtube"
 *   aspectRatio="16/9"
 * />
 *
 * // Vimeo video
 * <video
 *   src="123456789"
 *   source="vimeo"
 *   autoPlay
 *   muted
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
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(muted);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    // Calculate aspect ratio padding
    const dynamicAspectRatio = aspectRatio
      ? (() => {
          const [width, height] = aspectRatio.split("/").map(Number);
          return { aspectRatio: `${width} / ${height}`, width: "100%" };
        })()
      : undefined;

    // Sync video element state
    useEffect(() => {
      const video = videoRef.current;
      if (!video || source !== "native") {
        return;
      }

      const handleTimeUpdate = () => setCurrentTime(video.currentTime);
      const handleDurationChange = () => setDuration(video.duration);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleVolumeChange = () => {
        setVolume(video.volume);
        setIsMuted(video.muted);
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("durationchange", handleDurationChange);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("volumechange", handleVolumeChange);

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("durationchange", handleDurationChange);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("volumechange", handleVolumeChange);
      };
    }, [source]);

    // Control handlers
    const togglePlay = () => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    };

    const toggleMute = () => {
      const video = videoRef.current;
      if (!video) {
        return;
      }
      video.muted = !isMuted;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoRef.current;
      if (!video) {
        return;
      }
      const time = Number.parseFloat(e.target.value);
      video.currentTime = time;
      setCurrentTime(time);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoRef.current;
      if (!video) {
        return;
      }
      const vol = Number.parseFloat(e.target.value);
      video.volume = vol;
      setVolume(vol);
      if (vol === 0) {
        video.muted = true;
      } else if (isMuted) {
        video.muted = false;
      }
    };

    const formatTime = (seconds: number) => {
      if (!Number.isFinite(seconds)) {
        return "0:00";
      }
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const showCopyrightOverlay = copyright && copyrightPosition === "overlay";

    // Render YouTube embed
    if (source === "youtube") {
      const videoId = getYouTubeId(src);
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`;

      return (
        <>
          <Box
            ref={ref}
            className={cx(
              css({
                position: "relative",
                display: "block",
                overflow: "hidden",
                boxSizing: "border-box",
                ...cssProp,
              }),
              wrapperClassName,
            )}
            style={{ ...wrapperStyle, ...dynamicAspectRatio }}
          >
            <iframe
              src={embedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={css({
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
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
                  fontSize: "0.75rem",
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
                fontSize: "0.75rem",
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

      return (
        <>
          <Box
            ref={ref}
            className={cx(
              css({
                position: "relative",
                display: "block",
                overflow: "hidden",
                boxSizing: "border-box",
                ...cssProp,
              }),
              wrapperClassName,
            )}
            style={{ ...wrapperStyle, ...dynamicAspectRatio }}
          >
            <iframe
              src={embedUrl}
              title="Vimeo video player"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className={css({
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
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
                  fontSize: "0.75rem",
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
                fontSize: "0.75rem",
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
    return (
      <>
        <Box
          ref={ref}
          className={cx(
            css({
              position: "relative",
              display: "block",
              overflow: "hidden",
              boxSizing: "border-box",
              background: "black",
              ...cssProp,
            }),
            wrapperClassName,
          )}
          style={{ ...wrapperStyle, ...dynamicAspectRatio }}
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
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "contain",
              }),
              className,
            )}
            style={style}
            {...props}
          />

          {/* Custom controls */}
          {controls && (
            <Box
              css={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background:
                  "linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent)",
                p: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                opacity: 0,
                transition: "opacity 0.3s ease",
                _hover: {
                  opacity: 1,
                },
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0";
              }}
            >
              {/* Progress bar */}
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className={css({
                  width: "100%",
                  height: "4px",
                  cursor: "pointer",
                  appearance: "none",
                  background: "rgba(255, 255, 255, 0.3)",
                  borderRadius: "2px",
                  outline: "none",
                  "&::-webkit-slider-thumb": {
                    appearance: "none",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "white",
                    cursor: "pointer",
                  },
                  "&::-moz-range-thumb": {
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "white",
                    cursor: "pointer",
                    border: "none",
                  },
                })}
              />

              {/* Controls row */}
              <Box
                css={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                {/* Play/Pause button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className={css({
                    background: "transparent",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    padding: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    _hover: {
                      opacity: 0.8,
                    },
                  })}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ width: "24px", height: "24px" }}
                    role="img"
                    aria-hidden="true"
                  >
                    {isPlaying ? (
                      <>
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </>
                    ) : (
                      <path d="M8 5v14l11-7z" />
                    )}
                  </svg>
                </button>

                {/* Time display */}
                <Box
                  css={{
                    color: "white",
                    fontSize: "0.875rem",
                    fontFamily: "mono",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Box>

                {/* Spacer */}
                <Box css={{ flex: 1 }} />

                {/* Volume control */}
                <Box
                  css={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={toggleMute}
                    className={css({
                      background: "transparent",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      padding: "0.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "28px",
                      height: "28px",
                      _hover: {
                        opacity: 0.8,
                      },
                    })}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      style={{ width: "20px", height: "20px" }}
                      role="img"
                      aria-hidden="true"
                    >
                      {isMuted ? (
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                      ) : (
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                      )}
                    </svg>
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className={css({
                      width: "80px",
                      height: "4px",
                      cursor: "pointer",
                      appearance: "none",
                      background: "rgba(255, 255, 255, 0.3)",
                      borderRadius: "2px",
                      outline: "none",
                      "&::-webkit-slider-thumb": {
                        appearance: "none",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: "white",
                        cursor: "pointer",
                      },
                      "&::-moz-range-thumb": {
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: "white",
                        cursor: "pointer",
                        border: "none",
                      },
                    })}
                  />
                </Box>
              </Box>
            </Box>
          )}

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
                fontSize: "0.75rem",
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
              fontSize: "0.75rem",
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
