"use client";

import { useEffect, useRef } from "react";

import { Video } from "../video/video";

export const VIDEO_START_TIMEOUT_MS = 8000;

export interface SlideshowVideoSlideProps {
  videoUrl: string;
  videoPoster?: string;
  aspectRatio: string;
  holdUntilEnded: boolean;
  isActive: boolean;
  onFinished: () => void;
  onUnplayable: (videoUrl: string) => void;
}

export function SlideshowVideoSlide({
  videoUrl,
  videoPoster,
  aspectRatio,
  holdUntilEnded,
  isActive,
  onFinished,
  onUnplayable,
}: SlideshowVideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !holdUntilEnded) {
      return;
    }
    if (!isActive) {
      video.pause();
      video.currentTime = 0;
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
      onFinished();
    };
    const giveUp = () => {
      if (isDone) {
        return;
      }
      onUnplayable(videoUrl);
      finish();
    };
    const cancelTimeout = () => clearTimeout(startTimer);

    startTimer = setTimeout(giveUp, VIDEO_START_TIMEOUT_MS);

    video.addEventListener("ended", finish);
    video.addEventListener("error", giveUp);
    video.addEventListener("playing", cancelTimeout);
    video.currentTime = 0;
    video.play?.()?.catch(giveUp);

    return () => {
      isDone = true;
      clearTimeout(startTimer);
      video.removeEventListener("ended", finish);
      video.removeEventListener("error", giveUp);
      video.removeEventListener("playing", cancelTimeout);
    };
  }, [holdUntilEnded, isActive, onFinished, onUnplayable, videoUrl]);

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
