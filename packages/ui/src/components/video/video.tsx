"use client";

import { useReducedMotion } from "motion/react";
import type { RefObject, VideoHTMLAttributes } from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import {
  CopyrightLabel,
  type CopyrightPosition,
  isInlineCopyright,
} from "../copyright-label/copyright-label";
import { MediaSkeleton } from "../media-skeleton/media-skeleton";
import { getVimeoId, getYouTubeId, resolveAspectRatio, resolveMediaAspectRatio } from "./lib";
import { VideoControls } from "./video-controls";

export type VideoSource = "native" | "youtube" | "vimeo";

export interface VideoProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, "css" | "src"> {
  src: string;
  source?: VideoSource;
  poster?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  aspectRatio?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  copyright?: string;
  /** Asset source/credit, shown as a second line below the copyright. */
  copyrightSource?: string;
  copyrightPosition?: CopyrightPosition;
  mediaWidth?: number;
  mediaHeight?: number;
  mediaRef?: RefObject<HTMLVideoElement | null>;
  css?: SystemStyleObject;
}

const nativeFrameClass = css({
  background:
    "linear-gradient(135deg, var(--colors-neutral-100) 0%, var(--colors-neutral-200) 100%)",
  _pageDark: {
    background:
      "linear-gradient(135deg, var(--colors-neutral-900) 0%, var(--colors-neutral-800) 100%)",
  },
});

const mediaClass = css({
  position: "absolute",
  inset: 0,
  w: "100%",
  h: "100%",
  border: "none",
  transition: "opacity 0.5s ease-in-out",
});

const intrinsicMediaClass = css({
  display: "block",
  w: "100%",
  h: "auto",
  border: "none",
  transition: "opacity 0.5s ease-in-out",
});

const EMBED_DEFAULT_ASPECT_RATIO = "16/9";

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
      aspectRatio,
      objectFit = "cover",
      copyright,
      copyrightSource,
      copyrightPosition = "inline-white",
      mediaWidth,
      mediaHeight,
      mediaRef,
      className,
      style,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    const ownVideoRef = useRef<HTMLVideoElement>(null);
    const videoRef = mediaRef ?? ownVideoRef;
    const [isLoading, setIsLoading] = useState(true);
    const prefersReducedMotion = useReducedMotion();
    const shouldAutoPlay = autoPlay && !prefersReducedMotion;
    const isNative = source === "native";
    const cmsAspectRatio = resolveAspectRatio(aspectRatio);
    const mediaAspectRatio = resolveMediaAspectRatio(mediaWidth, mediaHeight);
    const containerAspectRatio =
      cmsAspectRatio ?? mediaAspectRatio ?? (isNative ? undefined : EMBED_DEFAULT_ASPECT_RATIO);
    const useIntrinsicLayout = isNative && !containerAspectRatio;
    const resolvedPoster = poster?.trim() ? poster.trim() : undefined;

    const handleReady = useCallback(() => {
      setIsLoading(false);
    }, []);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      // React sets the `muted` DOM property unreliably, which can block
      // autoplay; assign it imperatively so muted autoplay is honored.
      video.muted = muted;
      if (video.readyState >= 2) {
        handleReady();
      }

      if (!shouldAutoPlay) return;

      const media = video;
      function tryPlay() {
        if (!media.paused) return;
        try {
          void media.play()?.catch(() => {
            // Autoplay can race metadata; loadeddata / canplay retry below.
          });
        } catch {
          // jsdom and some browsers throw synchronously when play is blocked.
        }
      }

      tryPlay();
      media.addEventListener("loadeddata", tryPlay);
      media.addEventListener("canplay", tryPlay);
      return () => {
        media.removeEventListener("loadeddata", tryPlay);
        media.removeEventListener("canplay", tryPlay);
      };
    }, [handleReady, muted, shouldAutoPlay]);

    const isFirstSrc = useRef(true);
    useEffect(() => {
      if (isFirstSrc.current) {
        isFirstSrc.current = false;
        return;
      }
      const video = videoRef.current;
      if (!video || !isNative) return;
      setIsLoading(true);
      video.load();
    }, [src, isNative]);

    const hasCredit = Boolean(copyright || copyrightSource);
    const inline = hasCredit && isInlineCopyright(copyrightPosition);

    let media: React.ReactNode;
    if (source === "youtube") {
      const params = `autoplay=${shouldAutoPlay ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`;
      media = (
        <iframe
          src={`https://www.youtube.com/embed/${getYouTubeId(src)}?${params}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleReady}
          className={cx(mediaClass, className)}
          style={{ opacity: isLoading ? 0 : 1, ...style }}
        />
      );
    } else if (source === "vimeo") {
      const params = `autoplay=${shouldAutoPlay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`;
      media = (
        <iframe
          src={`https://player.vimeo.com/video/${getVimeoId(src)}?${params}`}
          title="Vimeo video player"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={handleReady}
          className={cx(mediaClass, className)}
          style={{ opacity: isLoading ? 0 : 1, ...style }}
        />
      );
    } else {
      media = (
        <>
          {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            src={src}
            poster={resolvedPoster}
            width={useIntrinsicLayout ? mediaWidth : undefined}
            height={useIntrinsicLayout ? mediaHeight : undefined}
            autoPlay={shouldAutoPlay}
            loop={loop}
            muted={muted}
            playsInline
            preload="metadata"
            onLoadedData={handleReady}
            onCanPlay={handleReady}
            onError={handleReady}
            className={cx(useIntrinsicLayout ? intrinsicMediaClass : mediaClass, className)}
            style={{
              opacity: isLoading ? 0 : 1,
              ...(useIntrinsicLayout ? {} : { objectFit }),
              ...style,
            }}
            {...props}
          />
          <VideoControls videoRef={videoRef} show={controls} />
        </>
      );
    }

    return (
      <>
        <Box
          ref={ref}
          className={isNative && !useIntrinsicLayout ? nativeFrameClass : undefined}
          css={{
            position: "relative",
            w: "100%",
            overflow: "hidden",
            ...(containerAspectRatio && { aspectRatio: containerAspectRatio }),
            ...cssProp,
          }}
        >
          {!useIntrinsicLayout && <MediaSkeleton visible={isLoading} />}
          {media}
          {inline && (
            <CopyrightLabel
              text={copyright}
              source={copyrightSource}
              position={copyrightPosition}
            />
          )}
        </Box>
        {hasCredit && copyrightPosition === "below" && (
          <CopyrightLabel text={copyright} source={copyrightSource} position="below" />
        )}
      </>
    );
  },
);

Video.displayName = "Video";
