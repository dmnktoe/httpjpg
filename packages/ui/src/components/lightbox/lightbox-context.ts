"use client";

import { createContext, useContext, useEffect } from "react";

import type { LightboxItem } from "./lightbox";

/** A page-queue entry. `id` is the blok `_uid` — one slot per mounted blok. */
export interface LightboxEntry extends LightboxItem {
  id: string;
}

export interface LightboxGalleryValue {
  /** Opens the shared viewer on the registered entry with this id. */
  openAt: (id: string) => void;
  /** Adds an entry to the page queue; the returned callback takes it out again. */
  registerItem: (item: LightboxEntry) => () => void;
}

export const LightboxGalleryContext = createContext<LightboxGalleryValue | null>(null);

/**
 * Null outside a `LightboxProvider` — the same seam `useAudioPlayer` draws, so
 * an image stays usable on its own (Storybook, tests) without a page-wide
 * gallery behind it.
 */
export function useLightboxGallery(): LightboxGalleryValue | null {
  return useContext(LightboxGalleryContext);
}

/** Keeps `item` in the page gallery for as long as the caller is mounted. */
export function useLightboxEntry(item: LightboxEntry | null): void {
  const registerItem = useLightboxGallery()?.registerItem;
  const id = item?.id;
  const src = item?.src;
  const alt = item?.alt;
  const srcSet = item?.srcSet;
  const sizes = item?.sizes;
  const caption = item?.caption;
  const copyright = item?.copyright;
  const copyrightSource = item?.copyrightSource;
  const hasVideo = Boolean(item?.video);
  const videoSource = item?.video?.source;
  const videoPoster = item?.video?.poster;
  const videoAspectRatio = item?.video?.aspectRatio;

  useEffect(() => {
    if (!registerItem || !id || !src) {
      return;
    }
    return registerItem({
      id,
      src,
      alt: alt ?? "",
      srcSet,
      sizes,
      caption,
      copyright,
      copyrightSource,
      video: hasVideo
        ? { source: videoSource, poster: videoPoster, aspectRatio: videoAspectRatio }
        : undefined,
    });
  }, [
    registerItem,
    id,
    src,
    alt,
    srcSet,
    sizes,
    caption,
    copyright,
    copyrightSource,
    hasVideo,
    videoSource,
    videoPoster,
    videoAspectRatio,
  ]);
}
