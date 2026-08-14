"use client";

import { ConsentPlaceholder, useVendorConsent } from "@httpjpg/consent";
import type { SbVideoData } from "@httpjpg/storyblok-utils";
import { extractPlainText } from "@httpjpg/storyblok-utils";
import { Box, Lightbox, LightboxTrigger, useLightbox, Video } from "@httpjpg/ui";
import { memo, useRef } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";
import { SbCaption, type SbCaptionProps } from "../caption/SbCaption";

export interface SbVideoProps {
  blok: SbVideoData;
}

function resolveSrc(blok: SbVideoProps["blok"]): string {
  if (blok.source === "youtube" || blok.source === "vimeo") {
    return blok.videoUrl || "";
  }
  return blok.video?.filename || blok.videoUrl || "";
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
    lightbox = false,
  } = blok;
  const copyright = video?.copyright;
  const copyrightSource = video?.source;
  const editable = editableAttrs(blok);
  // Only the embed sources gate on third-party consent; native video is local.
  const consent = useVendorConsent(source === "youtube" || source === "vimeo" ? source : null);
  const viewer = useLightbox();
  const inlineRef = useRef<HTMLVideoElement | null>(null);
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
      <Box css={{ position: "relative" }}>
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
          copyrightSource={copyrightSource}
          copyrightPosition={copyrightPosition}
          mediaRef={inlineRef}
        />
        {lightbox && (
          // Corner, not cover: the player underneath has its own controls to
          // press, and an invisible full-size hit area would swallow them.
          <LightboxTrigger
            variant="corner"
            label="Play the video at full size"
            onClick={() => {
              // Otherwise the copy behind the overlay keeps playing and the two
              // soundtracks stack. Only reachable for native video — an embed
              // is an iframe, and stopping it needs its own vendor API.
              inlineRef.current?.pause();
              viewer.openAt(0);
            }}
          />
        )}
      </Box>
      {caption?.content?.length ? <SbCaption data={caption as SbCaptionProps["data"]} /> : null}
      {lightbox && (
        <Lightbox
          open={viewer.open}
          items={[
            {
              src,
              alt: "",
              caption: extractPlainText(caption),
              copyright: copyright || "",
              video: { source, poster: poster?.filename, aspectRatio },
            },
          ]}
          index={0}
          onClose={viewer.close}
          onIndexChange={viewer.setIndex}
        />
      )}
    </Box>
  );
});

SbVideo.displayName = "SbVideo";
