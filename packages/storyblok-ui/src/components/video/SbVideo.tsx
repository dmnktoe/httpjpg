"use client";

import { ConsentPlaceholder, hasVendorConsent } from "@httpjpg/consent";
import type { StoryblokRichTextProps } from "@httpjpg/storyblok-richtext";
import type { VideoSource } from "@httpjpg/ui";
import { Video as VideoComponent } from "@httpjpg/ui";
import { memo, useEffect, useState } from "react";
import { useStoryblokEditable } from "../../lib/use-storyblok-editable";
import type { StoryblokVideoAsset } from "../../types";
import { SbCaption } from "../caption";
import { SbMediaWrapper } from "../media-wrapper";

export interface SbVideoProps {
  blok: {
    _uid: string;
    source: "native" | "youtube" | "vimeo";
    video?: StoryblokVideoAsset;
    videoUrl?: string;
    youtubeId?: string;
    vimeoId?: string;
    poster?: StoryblokVideoAsset;
    caption?: StoryblokRichTextProps["data"];
    aspectRatio?: "16/9" | "4/3" | "1/1" | "21/9";
    controls?: boolean;
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
    copyright?: string;
    copyrightPosition?: "below" | "overlay";
    width?: "full" | "container" | "narrow";
    spacingTop?: string;
    spacingBottom?: string;
  };
}

/**
 * Storyblok Video Component
 * Supports native videos, YouTube and Vimeo embeds
 */
export const SbVideo = memo(function SbVideo({ blok }: SbVideoProps) {
  const {
    source = "native",
    video,
    videoUrl,
    youtubeId,
    vimeoId,
    poster,
    caption,
    aspectRatio = "16/9",
    controls = true,
    autoPlay = false,
    loop = false,
    muted = false,
    copyright,
    copyrightPosition = "below",
    width = "full",
    spacingTop,
    spacingBottom,
  } = blok;

  // Determine video source
  let videoSrc = "";
  if (source === "native") {
    videoSrc = video?.filename || videoUrl || "";
  } else if (source === "youtube") {
    videoSrc = youtubeId || videoUrl || "";
  } else if (source === "vimeo") {
    videoSrc = vimeoId || videoUrl || "";
  }

  const editableProps = useStoryblokEditable(blok);

  // Track consent state and re-render on changes
  // Start with false to avoid hydration mismatch (server has no cookies)
  const [hasConsent, setHasConsent] = useState(false);

  // Check consent client-side only to avoid SSR/client mismatch
  useEffect(() => {
    if (source === "youtube") {
      setHasConsent(hasVendorConsent("youtube"));
    } else if (source === "vimeo") {
      setHasConsent(hasVendorConsent("vimeo"));
    } else {
      setHasConsent(true);
    }
  }, [source]);

  useEffect(() => {
    const handleConsentChange = () => {
      if (source === "youtube") {
        setHasConsent(hasVendorConsent("youtube"));
      } else if (source === "vimeo") {
        setHasConsent(hasVendorConsent("vimeo"));
      }
    };

    window.addEventListener("consentChange", handleConsentChange);
    return () =>
      window.removeEventListener("consentChange", handleConsentChange);
  }, [source]);

  if (!videoSrc) {
    return null;
  }

  // Check consent for external video providers
  if (source === "youtube" && !hasConsent) {
    return (
      <SbMediaWrapper
        spacingTop={spacingTop}
        spacingBottom={spacingBottom}
        width={width}
        editable={editableProps}
      >
        <ConsentPlaceholder vendor="YouTube" height="400px" />
      </SbMediaWrapper>
    );
  }

  if (source === "vimeo" && !hasConsent) {
    return (
      <SbMediaWrapper
        spacingTop={spacingTop}
        spacingBottom={spacingBottom}
        width={width}
        editable={editableProps}
      >
        <ConsentPlaceholder vendor="Vimeo" height="400px" />
      </SbMediaWrapper>
    );
  }

  return (
    <SbMediaWrapper
      spacingTop={spacingTop}
      spacingBottom={spacingBottom}
      width={width}
      editable={editableProps}
    >
      <VideoComponent
        src={videoSrc}
        source={source as VideoSource}
        poster={poster?.filename}
        aspectRatio={aspectRatio}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        copyright={copyright}
        copyrightPosition={copyrightPosition}
        css={{
          width: "100%",
        }}
      />

      {caption?.content && caption.content.length > 0 && (
        <SbCaption data={caption} />
      )}
    </SbMediaWrapper>
  );
});
