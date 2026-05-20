"use client";

import { ConsentPlaceholder, hasVendorConsent } from "@httpjpg/consent";
import type { StoryblokRichTextProps } from "@httpjpg/storyblok-richtext";
import type { StoryblokVideoAsset } from "@httpjpg/storyblok-utils";
import { Box, Video, type VideoSource } from "@httpjpg/ui";
import { memo, useEffect, useState } from "react";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";
import { SbCaption } from "../caption/SbCaption";

export interface SbVideoProps {
  blok: BlokSpacing & {
    _uid: string;
    source?: VideoSource;
    video?: StoryblokVideoAsset;
    videoUrl?: string;
    poster?: StoryblokVideoAsset;
    caption?: StoryblokRichTextProps["data"];
    aspectRatio?: string;
    controls?: boolean;
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
    copyrightPosition?: "inline-white" | "inline-black" | "below" | "overlay";
  };
}

function resolveSrc(blok: SbVideoProps["blok"]): string {
  if (blok.source === "youtube" || blok.source === "vimeo") {
    return blok.videoUrl || "";
  }
  return blok.video?.filename || blok.videoUrl || "";
}

function useConsent(source: VideoSource): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (source !== "youtube" && source !== "vimeo") {
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

export const SbVideo = memo(function SbVideo({ blok }: SbVideoProps) {
  const {
    source = "native",
    video,
    poster,
    caption,
    aspectRatio = "16/9",
    controls = true,
    autoPlay,
    loop,
    muted,
    copyrightPosition = "inline-white",
  } = blok;
  const copyright = video?.copyright;
  const editable = editableAttrs(blok);
  const consent = useConsent(source);
  const src = resolveSrc(blok);

  if (!src) {
    return null;
  }

  if (!consent) {
    return (
      <Box {...editable} css={spacingCss(blok)}>
        <ConsentPlaceholder vendor={source === "youtube" ? "YouTube" : "Vimeo"} height="400px" />
      </Box>
    );
  }

  return (
    <Box {...editable} css={spacingCss(blok)}>
      <Video
        src={src}
        source={source}
        poster={poster?.filename}
        aspectRatio={aspectRatio}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        copyright={copyright}
        copyrightPosition={copyrightPosition}
      />
      {caption?.content?.length ? <SbCaption data={caption} /> : null}
    </Box>
  );
});

SbVideo.displayName = "SbVideo";
