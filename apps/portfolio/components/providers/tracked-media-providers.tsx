"use client";

import {
  trackAudioPause,
  trackAudioPlay,
  trackAudioSkip,
  trackLightboxClose,
  trackLightboxNavigate,
  trackLightboxOpen,
} from "@httpjpg/analytics";
import {
  AudioPlayerProvider,
  type AudioTrack,
  LightboxProvider,
  type LightboxEntry,
} from "@httpjpg/ui";
import type { PropsWithChildren } from "react";
import { useCallback } from "react";

function lightboxType(item: LightboxEntry | undefined): "image" | "video" {
  return item?.video ? "video" : "image";
}

function lightboxMedia(item: LightboxEntry | undefined) {
  return {
    src: item?.src,
    alt: item?.alt,
  };
}

export function TrackedLightboxProvider({ children }: PropsWithChildren) {
  const handleOpen = useCallback((item: LightboxEntry, index: number, count: number) => {
    trackLightboxOpen({
      type: lightboxType(item),
      index,
      count,
      ...lightboxMedia(item),
    });
  }, []);

  const handleNavigate = useCallback((item: LightboxEntry, index: number, count: number) => {
    trackLightboxNavigate({
      type: lightboxType(item),
      index,
      count,
      ...lightboxMedia(item),
    });
  }, []);

  const handleClose = useCallback((item: LightboxEntry | undefined, index: number) => {
    trackLightboxClose({
      type: lightboxType(item),
      index,
      ...lightboxMedia(item),
    });
  }, []);

  return (
    <LightboxProvider onOpen={handleOpen} onNavigate={handleNavigate} onClose={handleClose}>
      {children}
    </LightboxProvider>
  );
}

export function TrackedAudioPlayerProvider({ children }: PropsWithChildren) {
  const handlePlay = useCallback((track: AudioTrack) => {
    trackAudioPlay({
      title: track.title,
      artist: track.artist,
      src: track.src,
      href: track.href,
    });
  }, []);

  const handlePause = useCallback((track: AudioTrack) => {
    trackAudioPause({
      title: track.title,
      artist: track.artist,
      src: track.src,
      href: track.href,
    });
  }, []);

  const handleSkip = useCallback((direction: "next" | "previous", track: AudioTrack) => {
    trackAudioSkip({
      direction,
      title: track.title,
      artist: track.artist,
      src: track.src,
      href: track.href,
    });
  }, []);

  return (
    <AudioPlayerProvider onPlay={handlePlay} onPause={handlePause} onSkip={handleSkip}>
      {children}
    </AudioPlayerProvider>
  );
}
