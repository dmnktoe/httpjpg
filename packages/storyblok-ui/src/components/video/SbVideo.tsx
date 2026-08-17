"use client";

import { ConsentPlaceholder, useVendorConsent } from "@httpjpg/consent";
import type { SbVideoData } from "@httpjpg/storyblok-utils";
import { extractPlainText } from "@httpjpg/storyblok-utils";
import {
  Box,
  Lightbox,
  type LightboxEntry,
  LightboxTrigger,
  useLightbox,
  useLightboxEntry,
  useLightboxGallery,
  Video,
} from "@httpjpg/ui";
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

function resolveOptionalString(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function toDimension(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return undefined;
}

export const SbVideo = memo(function SbVideo({ blok }: SbVideoProps) {
  const {
    source = "native",
    video,
    poster,
    caption,
    aspectRatio,
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
  const gallery = useLightboxGallery();
  const viewer = useLightbox();
  const inlineRef = useRef<HTMLVideoElement | null>(null);
  const src = resolveSrc(blok);
  const resolvedAspectRatio = resolveOptionalString(aspectRatio);
  const mediaWidth = toDimension(video?.width);
  const mediaHeight = toDimension(video?.height);
  const lightboxItem =
    lightbox && src && consent ? lightboxItemFromVideo(blok._uid, blok, src) : null;

  useLightboxEntry(lightboxItem);

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
          poster={resolveOptionalString(poster?.filename)}
          aspectRatio={resolvedAspectRatio}
          mediaWidth={mediaWidth}
          mediaHeight={mediaHeight}
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
              if (gallery && lightboxItem) {
                gallery.openAt(lightboxItem.id);
                return;
              }
              viewer.openAt(0);
            }}
          />
        )}
      </Box>
      {caption?.content?.length ? <SbCaption data={caption as SbCaptionProps["data"]} /> : null}
      {lightbox && !gallery && lightboxItem && (
        <Lightbox
          open={viewer.open}
          items={[lightboxItem]}
          index={0}
          onClose={viewer.close}
          onIndexChange={viewer.setIndex}
        />
      )}
    </Box>
  );
});

SbVideo.displayName = "SbVideo";

function lightboxItemFromVideo(id: string, blok: SbVideoProps["blok"], src: string): LightboxEntry {
  return {
    id,
    src,
    alt: "",
    caption: extractPlainText(blok.caption) || undefined,
    copyright: blok.video?.copyright || undefined,
    copyrightSource: blok.video?.source || undefined,
    video: {
      source: blok.source,
      poster: resolveOptionalString(blok.poster?.filename),
      aspectRatio: resolveOptionalString(blok.aspectRatio),
    },
  };
}
