"use client";

import type { ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";
import { VStack } from "../stack";

/**
 * Music player source types
 */
export type MusicSource = "spotify" | "soundcloud" | "mp3" | "custom";

/**
 * Spotify embed size
 */
export type SpotifySize = "compact" | "normal";

/**
 * Music player props
 */
export interface MusicPlayerProps {
  /**
   * Music source type
   * @default "mp3"
   */
  source?: MusicSource;
  /**
   * Source URL or ID
   * - For Spotify: Track/Album/Playlist URI or URL
   * - For SoundCloud: Track URL
   * - For MP3: Direct audio file URL
   */
  src: string;
  /**
   * Track title (for MP3 or custom display)
   */
  title?: string;
  /**
   * Artist name (for MP3 or custom display)
   */
  artist?: string;
  /**
   * Album artwork URL (for MP3 or custom display)
   */
  artwork?: string;
  /**
   * Spotify embed size
   * @default "normal"
   */
  spotifySize?: SpotifySize;
  /**
   * Show artwork
   * @default true
   */
  showArtwork?: boolean;
  /**
   * Show track info
   * @default true
   */
  showInfo?: boolean;
  /**
   * Autoplay
   * @default false
   */
  autoPlay?: boolean;
  /**
   * Custom ASCII decoration pattern
   * @default "･ﾟ⋆ ♪ ♫ ･ﾟ⋆"
   */
  decoration?: string;
  /**
   * Custom content above player
   */
  headerContent?: ReactNode;
  /**
   * Custom content below player
   */
  footerContent?: ReactNode;
  /**
   * Custom styles using Panda CSS
   */
  css?: SystemStyleObject;
  /**
   * Additional class name
   */
  className?: string;
}

/**
 * Extract Spotify ID from URI or URL
 */
function getSpotifyId(src: string): {
  type: "track" | "album" | "playlist";
  id: string;
} {
  // Handle spotify:track:xxx format
  if (src.startsWith("spotify:")) {
    const parts = src.split(":");
    return {
      type: parts[1] as "track" | "album" | "playlist",
      id: parts[2],
    };
  }

  // Handle https://open.spotify.com/track/xxx format
  const urlMatch = src.match(
    /spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/,
  );
  if (urlMatch) {
    return {
      type: urlMatch[1] as "track" | "album" | "playlist",
      id: urlMatch[2],
    };
  }

  // Default to track if just ID provided
  return { type: "track", id: src };
}

/**
 * Custom MP3 Player Controls
 */
const MP3Player = forwardRef<
  HTMLDivElement,
  {
    src: string;
    title?: string;
    artist?: string;
    artwork?: string;
    autoPlay?: boolean;
    showArtwork?: boolean;
    showInfo?: boolean;
  }
>(
  (
    { src, title, artist, artwork, autoPlay, showArtwork, showInfo },
    forwardedRef,
  ) => {
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
      const handleEnded = () => setIsPlaying(false);

      audio.addEventListener("timeupdate", updateTime);
      audio.addEventListener("loadedmetadata", updateDuration);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", updateTime);
        audio.removeEventListener("loadedmetadata", updateDuration);
        audio.removeEventListener("ended", handleEnded);
      };
    }, []);

    const togglePlay = () => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
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

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
      <Box ref={forwardedRef}>
        {/* biome-ignore lint/a11y/useMediaCaption: Music players don't require captions like video */}
        <audio ref={audioRef} src={src} autoPlay={autoPlay} />

        <VStack gap="3">
          {/* Artwork and Info */}
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

          {/* Controls */}
          <Box
            css={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Play/Pause and Time */}
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

            {/* Volume Control */}
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

/**
 * MusicPlayer - ASCII-styled music widget for portfolio
 *
 * A stylish, minimalistic, but cute kawaii ASCII-style music player that supports
 * Spotify embeds, SoundCloud embeds, and custom MP3 files. Perfect for artistic
 * portfolios with brutalist/ASCII design aesthetic.
 *
 * **Features:**
 * - 🎵 Multi-source support (Spotify, SoundCloud, MP3)
 * - 🎨 ASCII/kawaii decorations matching portfolio style
 * - 🎛️ Custom HTML5 audio player with controls
 * - 📱 Responsive and accessible
 * - ✨ Multiple visual variants
 *
 * @example
 * ```tsx
 * // Spotify embed
 * <MusicPlayer
 *   source="spotify"
 *   src="spotify:track:3n3Ppam7vgaVa1iaRUc9Lp"
 *   decoration="♪ ♫ ♪"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Custom MP3 player
 * <MusicPlayer
 *   source="mp3"
 *   src="https://example.com/track.mp3"
 *   title="My Track"
 *   artist="Artist Name"
 *   artwork="https://example.com/artwork.jpg"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // SoundCloud embed
 * <MusicPlayer
 *   source="soundcloud"
 *   src="https://soundcloud.com/artist/track"
 * />
 * ```
 */
export const MusicPlayer = forwardRef<HTMLDivElement, MusicPlayerProps>(
  (
    {
      source = "mp3",
      src,
      title,
      artist,
      artwork,
      spotifySize = "normal",
      showArtwork = true,
      showInfo = true,
      autoPlay = false,
      decoration = "･ﾟ⋆ ♪ ♫ ･ﾟ⋆",
      headerContent,
      footerContent,
      css: cssProp,
      className,
    },
    ref,
  ) => {
    const [embedUrl, setEmbedUrl] = useState("");

    useEffect(() => {
      if (source === "spotify") {
        const { type, id } = getSpotifyId(src);
        setEmbedUrl(
          `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
        );
      } else if (source === "soundcloud") {
        // SoundCloud requires the track URL to be URL-encoded
        setEmbedUrl(
          `https://w.soundcloud.com/player/?url=${encodeURIComponent(src)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`,
        );
      }
    }, [source, src]);

    const containerStyles = css.raw({
      p: 4,
      background: "transparent",
      position: "relative",
      _hover: {
        background: "neutral.50",
      },
    });

    const renderEmbed = () => {
      if (source === "spotify" && embedUrl) {
        // Spotify has two sizes: compact (152px) and normal (352px)
        const height = spotifySize === "compact" ? "152" : "352";
        return (
          <iframe
            src={embedUrl}
            width="100%"
            height={height}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={title || "Spotify Player"}
            className={css({
              borderRadius: "sm",
              border: "none",
            })}
          />
        );
      }

      if (source === "soundcloud" && embedUrl) {
        return (
          <iframe
            width="100%"
            height="166"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={embedUrl}
            title={title || "SoundCloud Player"}
            className={css({
              borderRadius: "sm",
            })}
          />
        );
      }

      if (source === "mp3") {
        return (
          <MP3Player
            src={src}
            title={title}
            artist={artist}
            artwork={artwork}
            autoPlay={autoPlay}
            showArtwork={showArtwork}
            showInfo={showInfo}
          />
        );
      }

      return null;
    };

    return (
      <Box
        ref={ref}
        className={cx(css(containerStyles), className)}
        css={cssProp}
      >
        <VStack gap="3">
          {/* ASCII Decoration Header */}
          {decoration && (
            <Box
              css={{
                fontSize: "xs",
                opacity: 60,
                textAlign: "center",
                fontFamily: "mono",
                letterSpacing: "wider",
              }}
            >
              {decoration}
            </Box>
          )}

          {/* Custom Header Content */}
          {headerContent && (
            <Box
              css={{
                fontSize: "sm",
                opacity: 70,
                textAlign: "center",
                fontFamily: "mono",
              }}
            >
              {headerContent}
            </Box>
          )}

          {/* Player */}
          {renderEmbed()}

          {/* Custom Footer Content */}
          {footerContent && (
            <Box
              css={{
                fontSize: "sm",
                opacity: 70,
                textAlign: "center",
                fontFamily: "mono",
              }}
            >
              {footerContent}
            </Box>
          )}

          {/* ASCII Decoration Footer */}
          {decoration && (
            <Box
              css={{
                fontSize: "xs",
                opacity: 60,
                textAlign: "center",
                fontFamily: "mono",
                letterSpacing: "wider",
              }}
            >
              {decoration}
            </Box>
          )}
        </VStack>
      </Box>
    );
  },
);

MusicPlayer.displayName = "MusicPlayer";
