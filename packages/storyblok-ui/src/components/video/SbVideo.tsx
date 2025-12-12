"use client";

import type { StoryblokRichTextProps } from "@httpjpg/storyblok-richtext";
import type { VideoSource } from "@httpjpg/ui";
import { video as VideoComponent } from "@httpjpg/ui";
import { memo } from "react";
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

  if (!videoSrc) {
    return null;
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
