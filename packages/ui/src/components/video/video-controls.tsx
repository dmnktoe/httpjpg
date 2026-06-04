"use client";

import { type RefObject, useEffect, useState } from "react";
import { css } from "styled-system/css";

import { Box } from "../box/box";

export interface VideoControlsProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  show?: boolean;
}

export function VideoControls({ videoRef, show = true }: VideoControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
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
  }, [videoRef]);

  if (!show) {
    return null;
  }

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

  return (
    <Box
      css={{
        position: "absolute",
        right: 0,
        bottom: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 4,
        opacity: 0,
        background: "linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent)",
        transition: "opacity 0.3s ease",
        _hover: { opacity: 1 },
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = "1";
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = "0";
      }}
    >
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={handleSeek}
        className={css({
          width: "100%",
          height: "1",
          background: "rgba(255, 255, 255, 0.3)",
          borderRadius: "sm",
          outline: "none",
          appearance: "none",
          cursor: "pointer",
          "&::-webkit-slider-thumb": {
            width: "3",
            height: "3",
            background: "white",
            borderRadius: "50%",
            appearance: "none",
            cursor: "pointer",
          },
          "&::-moz-range-thumb": {
            width: "3",
            height: "3",
            background: "white",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
          },
        })}
        aria-label="Seek"
      />

      <Box
        css={{
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <button
          type="button"
          onClick={togglePlay}
          className={css({
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "8",
            height: "8",
            padding: 1,
            color: "white",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            _hover: { opacity: 0.8 },
          })}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ width: "24px", height: "24px" }}
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
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

        <Box css={{ color: "white", fontFamily: "mono", fontSize: "sm", whiteSpace: "nowrap" }}>
          ╱╱ {formatTime(currentTime)} ⋄ {formatTime(duration)} ╱╱
        </Box>

        <Box css={{ flex: 1 }} />

        <Box
          css={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <button
            type="button"
            onClick={toggleMute}
            className={css({
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "7",
              height: "7",
              padding: 1,
              color: "white",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              _hover: { opacity: 0.8 },
            })}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ width: "20px", height: "20px" }}
              // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
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
              width: "20",
              height: "1",
              background: "rgba(255, 255, 255, 0.3)",
              borderRadius: "sm",
              outline: "none",
              appearance: "none",
              cursor: "pointer",
              "&::-webkit-slider-thumb": {
                width: "2.5",
                height: "2.5",
                background: "white",
                borderRadius: "50%",
                appearance: "none",
                cursor: "pointer",
              },
              "&::-moz-range-thumb": {
                width: "2.5",
                height: "2.5",
                background: "white",
                border: "none",
                borderRadius: "50%",
                cursor: "pointer",
              },
            })}
            aria-label="Volume"
          />
        </Box>
      </Box>
    </Box>
  );
}

VideoControls.displayName = "VideoControls";
