"use client";

import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Lightbox } from "./lightbox";
import {
  LightboxGalleryContext,
  type LightboxEntry,
  type LightboxGalleryValue,
} from "./lightbox-context";

/**
 * Owns the one lightbox of the page. Mounted in the root layout, it collects
 * every zoomable blok the way `AudioPlayerProvider` collects tracks, so prev /
 * next walk the page instead of a single blok's one-item array.
 */
export function LightboxProvider({ children }: PropsWithChildren) {
  const registryRef = useRef<LightboxEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<LightboxEntry[]>([]);

  const registerItem = useCallback((entry: LightboxEntry) => {
    registryRef.current = [...registryRef.current, entry];
    return () => {
      registryRef.current = registryRef.current.filter((item) => item !== entry);
      setItems((current) => current.filter((item) => item.id !== entry.id));
    };
  }, []);

  const openAt = useCallback((id: string) => {
    const snapshot = dedupeById(registryRef.current);
    const nextIndex = snapshot.findIndex((item) => item.id === id);
    if (nextIndex < 0) {
      return;
    }
    setItems(snapshot);
    setIndex(nextIndex);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (open && items.length === 0) {
      setOpen(false);
    }
  }, [open, items.length]);

  const value = useMemo<LightboxGalleryValue>(
    () => ({ openAt, registerItem }),
    [openAt, registerItem],
  );

  return (
    <LightboxGalleryContext.Provider value={value}>
      {children}
      <Lightbox open={open} items={items} index={index} onClose={close} onIndexChange={setIndex} />
    </LightboxGalleryContext.Provider>
  );
}

function dedupeById(entries: LightboxEntry[]): LightboxEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.id)) {
      return false;
    }
    seen.add(entry.id);
    return true;
  });
}
