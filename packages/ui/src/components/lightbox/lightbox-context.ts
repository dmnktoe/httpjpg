"use client";

import { createContext, useContext, useEffect } from "react";

import type { LightboxItem } from "./lightbox";

/** A page-queue entry. `id` is the blok `_uid` — one slot per mounted blok. */
export interface LightboxEntry extends LightboxItem {
  id: string;
}

export interface LightboxGalleryValue {
  openAt: (id: string) => void;
  registerItem: (item: LightboxEntry) => () => void;
}

export const LightboxGalleryContext = createContext<LightboxGalleryValue | null>(null);

/** Null outside a `LightboxProvider`, so an image stays usable in Storybook. */
export function useLightboxGallery(): LightboxGalleryValue | null {
  return useContext(LightboxGalleryContext);
}

/** Keeps `item` in the page gallery for as long as the caller is mounted. */
export function useLightboxEntry(item: LightboxEntry | null): void {
  const registerItem = useLightboxGallery()?.registerItem;
  const serialized = item?.id && item.src ? JSON.stringify(item) : "";

  useEffect(() => {
    if (!registerItem || !serialized) {
      return;
    }
    return registerItem(JSON.parse(serialized) as LightboxEntry);
  }, [registerItem, serialized]);
}
