"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { css } from "styled-system/css";

import { Box } from "../box/box";
import { VStack } from "../stack/stack";

export interface MP3PlayerProps {
  src: string;
  title?: string;
  artist?: string;
  artwork?: string;
  autoPlay?: boolean;
  showArtwork?: boolean;
  showInfo?: boolean;
}

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export const MP3Player = forwardRef<HTMLDivElement, MP3PlayerProps>(
  ({ src, title, artist, artwork, autoPlay, showArtwork, showInfo }, forwardedRef) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const syncPlaybackState = () => setIsPlaying(!audio.paused);

      audio.addEventListener("timeupdate", updateTime);
      audio.addEventListener("loadedmetadata", updateDuration);
      audio.addEventListener("play", syncPlaybackState);
      audio.addEventListener("pause", syncPlaybackState);
      audio.addEventListener("ended", syncPlaybackState);

      return () => {
        audio.removeEventListener("timeupdate", updateTime);
        audio.removeEventListener("loadedmetadata", updateDuration);
        audio.removeEventListener("play", syncPlaybackState);
        audio.removeEventListener("pause", syncPlaybackState);
        audio.removeEventListener("ended", syncPlaybackState);
      };
    }, []);

    // Don't flip isPlaying here — play/pause event listeners do that, so the
    // UI stays in sync even if play() rejects (autoplay policy, etc.).
    const togglePlay = async () => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      if (audio.paused) {
        try {
          await audio.play();
        } catch {
          // pause event would not fire, state already reflects paused.
        }
      } else {
        audio.pause();
      }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      const time = Number.parseFloat(e.target.value);
      audio.currentTime = time;
      setCurrentTime(time);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      const vol = Number.parseFloat(e.target.value);
      audio.volume = vol;
      setVolume(vol);
    };

    return (
      <Box ref={forwardedRef}>
        {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
        <audio ref={audioRef} src={src} autoPlay={autoPlay} aria-label={title || "Audio player"} />

        <VStack gap="3">
          {(showArtwork || showInfo) && (
            <Box css={{ display: "flex", alignItems: "center", gap: 3 }}>
              {showArtwork && artwork && (
                <Box
                  css={{
                    display: "flex",
                    flexShrink: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    w: 16,
                    h: 16,
                    background: "neutral.100",
                    borderRadius: "sm",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={artwork}
                    alt={title || "Album artwork"}
                    className={css({
                      w: "full",
                      h: "full",
                      objectFit: "cover",
                    })}
                  />
                </Box>
              )}
              {showInfo && (title || artist) && (
                <Box css={{ flex: 1, minW: 0 }}>
                  {title && (
                    <Box
                      css={{
                        fontFamily: "mono",
                        fontSize: "sm",
                        fontWeight: "semibold",
                        letterSpacing: "wide",
                        truncate: true,
                      }}
                    >
                      {title}
                    </Box>
                  )}
                  {artist && (
                    <Box
                      css={{
                        mt: 0.5,
                        opacity: 60,
                        fontFamily: "mono",
                        fontSize: "xs",
                        truncate: true,
                      }}
                    >
                      {artist}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}

          <Box
            css={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box
              css={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <button
                type="button"
                onClick={togglePlay}
                className={css({
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minW: "60px",
                  px: 2,
                  py: 1,
                  color: "white",
                  fontFamily: "mono",
                  fontSize: "sm",
                  background: "neutral.900",
                  border: "none",
                  borderRadius: "sm",
                  transition: "all 0.2s",
                  cursor: "pointer",
                  _hover: { background: "neutral.800" },
                })}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? "∥ PAUSE" : "▸ PLAY"}
              </button>

              <Box css={{ flex: 1, minW: 0 }}>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Seek"
                  className={css({
                    w: "full",
                    h: "4px",
                    background: "neutral.200",
                    borderRadius: "full",
                    outline: "none",
                    appearance: "none",
                    cursor: "pointer",
                    _hover: { background: "neutral.300" },
                    "&::-webkit-slider-thumb": {
                      w: "12px",
                      h: "12px",
                      background: "neutral.900",
                      borderRadius: "full",
                      appearance: "none",
                      cursor: "pointer",
                    },
                    "&::-moz-range-thumb": {
                      w: "12px",
                      h: "12px",
                      background: "neutral.900",
                      border: "none",
                      borderRadius: "full",
                      cursor: "pointer",
                    },
                  })}
                />
              </Box>

              <Box
                css={{
                  minW: "70px",
                  opacity: 60,
                  fontFamily: "mono",
                  fontSize: "2xs",
                  textAlign: "right",
                }}
              >
                {formatTime(currentTime)} / {formatTime(duration)}
              </Box>
            </Box>

            <Box
              css={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box css={{ opacity: 60, fontSize: "xs" }}>VOL</Box>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className={css({
                  flex: 1,
                  h: "3px",
                  background: "neutral.200",
                  borderRadius: "full",
                  outline: "none",
                  appearance: "none",
                  cursor: "pointer",
                  _hover: { background: "neutral.300" },
                  "&::-webkit-slider-thumb": {
                    w: "10px",
                    h: "10px",
                    background: "neutral.900",
                    borderRadius: "full",
                    appearance: "none",
                    cursor: "pointer",
                  },
                  "&::-moz-range-thumb": {
                    w: "10px",
                    h: "10px",
                    background: "neutral.900",
                    border: "none",
                    borderRadius: "full",
                    cursor: "pointer",
                  },
                })}
                aria-label="Volume"
              />
              <Box css={{ minW: "30px", opacity: 60, fontSize: "xs", textAlign: "right" }}>
                {Math.round(volume * 100)}%
              </Box>
            </Box>
          </Box>
        </VStack>
      </Box>
    );
  },
);

MP3Player.displayName = "MP3Player";
