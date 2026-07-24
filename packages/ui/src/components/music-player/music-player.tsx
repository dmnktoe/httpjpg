"use client";

import type { ReactNode } from "react";
import { forwardRef, useEffect, useState } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { ASCII_DIVIDER_MUSIC } from "../ascii-art/banners";
import { Box } from "../box/box";
import { VStack } from "../stack/stack";
import { MP3Player } from "./mp3-player";
import { getSpotifyId } from "./spotify-id";

export type MusicSource = "spotify" | "soundcloud" | "mp3";

export type SpotifySize = "compact" | "normal";

export interface MusicPlayerProps {
  source?: MusicSource;
  src: string;
  title?: string;
  artist?: string;
  artwork?: string;
  spotifySize?: SpotifySize;
  showArtwork?: boolean;
  showInfo?: boolean;
  autoPlay?: boolean;
  decoration?: string;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  css?: SystemStyleObject;
  className?: string;
}

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
      decoration = ASCII_DIVIDER_MUSIC,
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
        setEmbedUrl(`https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`);
      } else if (source === "soundcloud") {
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
        const height = spotifySize === "compact" ? "152" : "352";
        return (
          // oxlint-disable-next-line jsx-a11y/iframe-has-title
          <iframe
            src={embedUrl}
            width="100%"
            height={height}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={title || "Spotify Player"}
            className={css({ border: "none", borderRadius: "sm" })}
          />
        );
      }

      if (source === "soundcloud" && embedUrl) {
        return (
          // oxlint-disable-next-line jsx-a11y/iframe-has-title
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
      <Box ref={ref} className={cx(css(containerStyles), className)} css={cssProp}>
        <VStack gap="3">
          {decoration && (
            <Box
              css={{
                opacity: 60,
                fontFamily: "mono",
                fontSize: "xs",
                letterSpacing: "wider",
                textAlign: "center",
              }}
            >
              {decoration}
            </Box>
          )}

          {headerContent && (
            <Box css={{ opacity: 70, fontFamily: "mono", fontSize: "sm", textAlign: "center" }}>
              {headerContent}
            </Box>
          )}

          {renderEmbed()}

          {footerContent && (
            <Box css={{ opacity: 70, fontFamily: "mono", fontSize: "sm", textAlign: "center" }}>
              {footerContent}
            </Box>
          )}

          {decoration && (
            <Box
              css={{
                opacity: 60,
                fontFamily: "mono",
                fontSize: "xs",
                letterSpacing: "wider",
                textAlign: "center",
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
