"use client";

import { useReducedMotion } from "framer-motion";
import type { VideoHTMLAttributes } from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { css, cx } from "styled-system/css";
import { token } from "styled-system/tokens";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { CopyrightLabel, type CopyrightPosition } from "../copyright-label/copyright-label";
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
  copyrightPosition?: CopyrightPosition;
  css?: SystemStyleObject;
}

function getYouTubeId(url: string): string {
  if (url.length === 11 && !url.includes("/") && !url.includes("?")) {
    return url;
  }
  const match = url.match(
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/,
  );
  return match && match[7].length === 11 ? match[7] : url;
}

function getVimeoId(url: string): string {
  if (/^\d+$/.test(url)) {
    return url;
  }
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : url;
}

const skeletonClass = css({
  position: "absolute",
  inset: 0,
  zIndex: 1,
  w: "100%",
  h: "100%",
  bg: `linear-gradient(90deg, ${token.var("colors.neutral.100")} 0%, ${token.var("colors.neutral.200")} 50%, ${token.var("colors.neutral.100")} 100%)`,
  backgroundSize: "200% 100%",
  transition: "opacity 0.5s ease-in-out",
  animation: "shimmer 1.5s ease-in-out infinite",
  pointerEvents: "none",
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
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
      objectFit = "contain",
      copyright,
      copyrightPosition = "inline-white",
      className,
      style,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const prefersReducedMotion = useReducedMotion();
    const shouldAutoPlay = autoPlay && !prefersReducedMotion;

    const handleReady = useCallback(() => setIsLoading(false), []);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      // React sets the `muted` DOM property unreliably, which can block
      // autoplay; assign it imperatively so muted autoplay is honored.
      video.muted = muted;
      if (video.readyState >= 2) {
        setIsLoading(false);
      }
    }, [muted]);

    const inline =
      copyright &&
      (copyrightPosition === "inline-white" ||
        copyrightPosition === "inline-black" ||
        copyrightPosition === "overlay");

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
            poster={poster}
            autoPlay={shouldAutoPlay}
            loop={loop}
            muted={muted}
            playsInline
            preload="metadata"
            onLoadedData={handleReady}
            onCanPlay={handleReady}
            onError={handleReady}
            className={cx(mediaClass, className)}
            style={{ opacity: isLoading ? 0 : 1, objectFit, ...style }}
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
          css={{
            position: "relative",
            w: "100%",
            overflow: "hidden",
            aspectRatio,
            ...(source === "native" && {
              background: `linear-gradient(135deg, ${token.var("colors.neutral.100")} 0%, ${token.var("colors.neutral.200")} 100%)`,
            }),
            ...cssProp,
          }}
        >
          <Box className={skeletonClass} style={{ opacity: isLoading ? 1 : 0 }} />
          {media}
          {inline && <CopyrightLabel text={copyright} position={copyrightPosition} />}
        </Box>
        {copyright && copyrightPosition === "below" && (
          <CopyrightLabel text={copyright} position="below" />
        )}
      </>
    );
  },
);

Video.displayName = "Video";
