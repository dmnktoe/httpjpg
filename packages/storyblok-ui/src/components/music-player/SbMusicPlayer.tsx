"use client";

import { ConsentPlaceholder, useVendorConsent } from "@httpjpg/consent";
import type { SbMusicPlayerData } from "@httpjpg/storyblok-utils";
import { ASCII_DIVIDER_MUSIC, Box, MusicPlayer } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbMusicPlayerProps {
  blok: SbMusicPlayerData;
}

export const SbMusicPlayer = memo(function SbMusicPlayer({ blok }: SbMusicPlayerProps) {
  const {
    source = "mp3",
    src,
    title,
    artist,
    artwork,
    spotifySize = "normal",
    showArtwork = true,
    showInfo = true,
    autoPlay,
    decoration = ASCII_DIVIDER_MUSIC,
    headerText,
    footerText,
  } = blok;
  const editable = editableAttrs(blok);
  // Only the streaming embeds gate on third-party consent; mp3 is local.
  const consent = useVendorConsent(source === "spotify" || source === "soundcloud" ? source : null);

  if (!src) {
    return null;
  }

  if (!consent) {
    return (
      <Box {...editable}>
        <ConsentPlaceholder
          vendor={source === "spotify" ? "Spotify" : "SoundCloud"}
          height="166px"
        />
      </Box>
    );
  }

  return (
    <Box {...editable}>
      <MusicPlayer
        source={source}
        src={src}
        title={title}
        artist={artist}
        artwork={artwork}
        spotifySize={spotifySize}
        showArtwork={showArtwork}
        showInfo={showInfo}
        autoPlay={autoPlay}
        decoration={decoration}
        headerContent={headerText ? <Box as="span">{headerText}</Box> : undefined}
        footerContent={footerText ? <Box as="span">{footerText}</Box> : undefined}
        css={spacingCss(blok)}
      />
    </Box>
  );
});

SbMusicPlayer.displayName = "SbMusicPlayer";
