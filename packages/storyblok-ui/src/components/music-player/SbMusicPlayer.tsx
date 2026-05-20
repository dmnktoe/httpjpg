"use client";

import { ConsentPlaceholder, hasVendorConsent } from "@httpjpg/consent";
import { ASCII_DIVIDER_MUSIC, Box, MusicPlayer, type MusicPlayerProps } from "@httpjpg/ui";
import { memo, useEffect, useState } from "react";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

type Source = MusicPlayerProps["source"];

export interface SbMusicPlayerProps {
  blok: BlokSpacing & {
    _uid: string;
    source?: Source;
    src: string;
    title?: string;
    artist?: string;
    artwork?: string;
    spotifySize?: MusicPlayerProps["spotifySize"];
    showArtwork?: boolean;
    showInfo?: boolean;
    autoPlay?: boolean;
    decoration?: string;
    headerText?: string;
    footerText?: string;
  };
}

function useConsent(source: Source): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (source !== "spotify" && source !== "soundcloud") {
      setOk(true);
      return;
    }
    const check = () => setOk(hasVendorConsent(source));
    check();
    window.addEventListener("consentChange", check);
    return () => window.removeEventListener("consentChange", check);
  }, [source]);
  return ok;
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
  const consent = useConsent(source);

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
