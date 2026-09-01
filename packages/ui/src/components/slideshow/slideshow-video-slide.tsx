"use client";

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
