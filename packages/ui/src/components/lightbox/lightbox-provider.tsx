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
    registryRef.current = [...registryRef.current.filter((item) => item.id !== entry.id), entry];
    setItems((current) => {
      const at = current.findIndex((item) => item.id === entry.id);
      if (at < 0) {
        return current;
      }
      const next = [...current];
      next[at] = entry;
      return next;
    });
    return () => {
      registryRef.current = registryRef.current.filter((item) => item !== entry);
      // Defer the prune so a re-register in the same tick (caption edit,
      // Strict Mode remount) can put the id back before the open snapshot
      // drops it.
      queueMicrotask(() => {
        const ids = new Set(dedupeById(registryRef.current).map((item) => item.id));
        setItems((current) => {
          const next = current.filter((item) => ids.has(item.id));
          return next.length === current.length ? current : next;
        });
      });
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
