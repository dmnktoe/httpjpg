"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { Video } from "../video/video";

export const VIDEO_START_TIMEOUT_MS = 8000;

function rewind(video: HTMLVideoElement) {
  try {
    video.currentTime = 0;
  } catch {
    // currentTime throws before metadata is ready and would abort play().
  }
}

export interface SlideshowVideoSlideProps {
  videoUrl: string;
  videoPoster?: string;
  aspectRatio: string;
  holdUntilEnded: boolean;
  isActive: boolean;
  onDone: () => void;
}

export function SlideshowVideoSlide({
  videoUrl,
  videoPoster,
  aspectRatio,
  holdUntilEnded,
  isActive,
  onDone,
}: SlideshowVideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // When the slideshow is not managing playback — a lone video, or waitForVideo
  // off — the clip relies on its autoplay attribute, which browsers ignore for a
  // <video> created during a client-side navigation. Start it ourselves so it
  // plays on arrival like it does on a hard load; reduced motion opts out.
  useEffect(() => {
    if (holdUntilEnded || !isActive || prefersReducedMotion) {
      return;
    }
    videoRef.current?.play?.()?.catch(() => {});
  }, [holdUntilEnded, isActive, prefersReducedMotion, videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !holdUntilEnded) {
      return;
    }
    if (!isActive) {
      video.pause();
      rewind(video);
      return;
    }

    let isDone = false;
    let startTimer: ReturnType<typeof setTimeout>;
    const finish = () => {
      if (isDone) {
        return;
      }
      isDone = true;
      clearTimeout(startTimer);
      onDone();
    };

    const cancelTimeout = () => clearTimeout(startTimer);
    startTimer = setTimeout(finish, VIDEO_START_TIMEOUT_MS);
    video.addEventListener("ended", finish);
    video.addEventListener("error", finish);
    video.addEventListener("playing", cancelTimeout);
    rewind(video);

    return () => {
      isDone = true;
      clearTimeout(startTimer);
      video.removeEventListener("ended", finish);
      video.removeEventListener("error", finish);
      video.removeEventListener("playing", cancelTimeout);
    };
  }, [holdUntilEnded, isActive, onDone]);

  return (
    <Video
      src={videoUrl}
      poster={videoPoster}
      aspectRatio={aspectRatio}
      objectFit="cover"
      mediaRef={videoRef}
      autoPlay={!holdUntilEnded || isActive}
      muted
      loop={!holdUntilEnded}
      controls={false}
      css={{
        w: "full",
        h: "full",
      }}
    />
  );
}
