"use client";

import { MusicPlayer, type MusicPlayerProps as BaseMusicPlayerProps } from "@httpjpg/ui";
import { memo } from "react";
import { mapSpacingToToken } from "../../lib/spacing-utils";
import { useStoryblokEditable } from "../../lib/use-storyblok-editable";

export interface SbMusicPlayerProps {
  blok: {
    _uid: string;
    source?: "spotify" | "soundcloud" | "mp3" | "custom";
    src: string;
    title?: string;
    artist?: string;
    artwork?: string;
    variant?: "default" | "minimal" | "card";
    showArtwork?: boolean;
    showInfo?: boolean;
    autoPlay?: boolean;
    decoration?: string;
    headerText?: string;
    footerText?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
  };
}

/**
 * Storyblok Music Player Component
 * 
 * ASCII-styled music widget for Storyblok CMS integration.
 * Supports Spotify embeds, SoundCloud embeds, and custom MP3 files.
 * 
 * Features:
 * - Multi-source support (Spotify, SoundCloud, MP3)
 * - ASCII/kuwaii decorations matching portfolio style
 * - Custom HTML5 audio player with controls for MP3s
 * - Configurable via Storyblok CMS
 * 
 * @example
 * In Storyblok, add a "music_player" component with:
 * - source: "spotify"
 * - src: "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp"
 * - decoration: "♪ ♫ ♪"
 */
export const SbMusicPlayer = memo(function SbMusicPlayer({ blok }: SbMusicPlayerProps) {
  const {
    source = "mp3",
    src,
    title,
    artist,
    artwork,
    variant = "default",
    showArtwork = true,
    showInfo = true,
    autoPlay = false,
    decoration = "♪ ♫ ♪ ♫ ♪ ♫ ♪",
    headerText,
    footerText,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
  } = blok;

  const editableProps = useStoryblokEditable(blok);

  // Return null if src is missing (required field)
  if (!src) {
    return null;
  }

  return (
    <div {...editableProps}>
      <MusicPlayer
        source={source}
        src={src}
        title={title}
        artist={artist}
        artwork={artwork}
        variant={variant}
        showArtwork={showArtwork}
        showInfo={showInfo}
        autoPlay={autoPlay}
        decoration={decoration}
        headerContent={headerText ? <div>{headerText}</div> : undefined}
        footerContent={footerText ? <div>{footerText}</div> : undefined}
        css={{
          mt: mapSpacingToToken(marginTop),
          mb: mapSpacingToToken(marginBottom),
          ml: mapSpacingToToken(marginLeft),
          mr: mapSpacingToToken(marginRight),
        }}
      />
    </div>
  );
});
