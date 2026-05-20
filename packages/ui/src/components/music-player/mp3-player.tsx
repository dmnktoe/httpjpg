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
        <audio ref={audioRef} src={src} autoPlay={autoPlay} />

        <VStack gap="3">
          {(showArtwork || showInfo) && (
            <Box
              css={{
                display: "flex",
                gap: 3,
                alignItems: "center",
              }}
            >
              {showArtwork && artwork && (
                <Box
                  css={{
                    w: 16,
                    h: 16,
                    flexShrink: 0,
                    borderRadius: "sm",
                    overflow: "hidden",
                    background: "neutral.100",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                        fontSize: "sm",
                        fontWeight: "semibold",
                        fontFamily: "mono",
                        truncate: true,
                        letterSpacing: "wide",
                      }}
                    >
                      {title}
                    </Box>
                  )}
                  {artist && (
                    <Box
                      css={{
                        fontSize: "xs",
                        opacity: 60,
                        fontFamily: "mono",
                        truncate: true,
                        mt: 0.5,
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
                  cursor: "pointer",
                  background: "neutral.900",
                  color: "white",
                  border: "none",
                  fontSize: "sm",
                  px: 2,
                  py: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "sm",
                  fontFamily: "mono",
                  minW: "60px",
                  transition: "all 0.2s",
                  _hover: {
                    background: "neutral.800",
                  },
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
                  className={css({
                    w: "full",
                    h: "4px",
                    cursor: "pointer",
                    appearance: "none",
                    background: "neutral.200",
                    borderRadius: "full",
                    outline: "none",
                    _hover: {
                      background: "neutral.300",
                    },
                    "&::-webkit-slider-thumb": {
                      appearance: "none",
                      w: "12px",
                      h: "12px",
                      borderRadius: "full",
                      background: "neutral.900",
                      cursor: "pointer",
                    },
                    "&::-moz-range-thumb": {
                      w: "12px",
                      h: "12px",
                      borderRadius: "full",
                      background: "neutral.900",
                      border: "none",
                      cursor: "pointer",
                    },
                  })}
                />
              </Box>

              <Box
                css={{
                  fontSize: "2xs",
                  fontFamily: "mono",
                  minW: "70px",
                  textAlign: "right",
                  opacity: 60,
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
              <Box css={{ fontSize: "xs", opacity: 60 }}>VOL</Box>
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
                  cursor: "pointer",
                  appearance: "none",
                  background: "neutral.200",
                  borderRadius: "full",
                  outline: "none",
                  _hover: {
                    background: "neutral.300",
                  },
                  "&::-webkit-slider-thumb": {
                    appearance: "none",
                    w: "10px",
                    h: "10px",
                    borderRadius: "full",
                    background: "neutral.900",
                    cursor: "pointer",
                  },
                  "&::-moz-range-thumb": {
                    w: "10px",
                    h: "10px",
                    borderRadius: "full",
                    background: "neutral.900",
                    border: "none",
                    cursor: "pointer",
                  },
                })}
                aria-label="Volume"
              />
              <Box
                css={{
                  fontSize: "xs",
                  opacity: 60,
                  minW: "30px",
                  textAlign: "right",
                }}
              >
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
