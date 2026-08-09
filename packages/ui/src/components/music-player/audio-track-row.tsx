"use client";

import { css } from "styled-system/css";

import { Box } from "../box/box";
import { formatTime } from "./lib";

export interface AudioTrackRowProps {
  title?: string;
  artist?: string;
  artwork?: string;
  showArtwork?: boolean;
  showInfo?: boolean;
  /** True while this row's track is the one loaded in the page-wide player. */
  isActive: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onToggle: () => void;
  onSeek: (time: number) => void;
}

/**
 * The in-page face of a track, mirroring the iOS blok: metadata and one button
 * that hands playback to the page-wide player. Transport and progress only show
 * up once this row owns the engine.
 */
export function AudioTrackRow({
  title,
  artist,
  artwork,
  showArtwork = true,
  showInfo = true,
  isActive,
  isPlaying,
  currentTime,
  duration,
  onToggle,
  onSeek,
}: AudioTrackRowProps) {
  const isActivePlaying = isActive && isPlaying;

  return (
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
            className={css({ w: "full", h: "full", objectFit: "cover" })}
          />
        </Box>
      )}

      <Box css={{ flex: 1, minW: 0 }}>
        {showInfo && (title || artist) && (
          <>
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
                css={{ mt: 0.5, opacity: 60, fontFamily: "mono", fontSize: "xs", truncate: true }}
              >
                {artist}
              </Box>
            )}
          </>
        )}

        {isActive && (
          <Box css={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(event) => onSeek(Number.parseFloat(event.target.value))}
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
        )}
      </Box>

      <Box
        as="button"
        type="button"
        onClick={onToggle}
        aria-label={isActivePlaying ? "Pause" : "Play"}
        css={{
          display: "flex",
          flexShrink: 0,
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
        }}
      >
        {isActivePlaying ? "∥ PAUSE" : "▸ PLAY"}
      </Box>
    </Box>
  );
}
