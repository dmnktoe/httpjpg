"use client";

import { type PropsWithChildren, useCallback, useMemo, useRef, useState } from "react";

import { Lightbox } from "./lightbox";
import {
  LightboxGalleryContext,
  type LightboxEntry,
  type LightboxGalleryValue,
} from "./lightbox-context";

export interface LightboxProviderProps extends PropsWithChildren {
  /** Fires once when the gallery opens on an item. */
  onOpen?: (item: LightboxEntry, index: number, count: number) => void;
  /** Fires when the visible index changes while open (not on the initial open). */
  onNavigate?: (item: LightboxEntry, index: number, count: number) => void;
  /** Fires when the gallery closes. */
  onClose?: (item: LightboxEntry | undefined, index: number) => void;
}

export function LightboxProvider({ children, onOpen, onNavigate, onClose }: LightboxProviderProps) {
  const registryRef = useRef<LightboxEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<LightboxEntry[]>([]);
  const openRef = useRef(false);
  const indexRef = useRef(0);
  const itemsRef = useRef<LightboxEntry[]>([]);

  const registerItem = useCallback((entry: LightboxEntry) => {
    registryRef.current = [...registryRef.current.filter((item) => item.id !== entry.id), entry];
    setItems((current) => {
      const at = current.findIndex((item) => item.id === entry.id);
      if (at < 0) {
        return current;
      }
      const next = [...current];
      next[at] = entry;
      itemsRef.current = next;
      return next;
    });
    return () => {
      registryRef.current = registryRef.current.filter((item) => item !== entry);
      queueMicrotask(() => {
        const ids = new Set(dedupeById(registryRef.current).map((item) => item.id));
        setItems((current) => {
          const next = current.filter((item) => ids.has(item.id));
          if (next.length === current.length) {
            return current;
          }
          itemsRef.current = next;
          return next;
        });
      });
    };
  }, []);

  const openAt = useCallback(
    (id: string) => {
      const snapshot = dedupeById(registryRef.current);
      const nextIndex = snapshot.findIndex((item) => item.id === id);
      if (nextIndex < 0) {
        return;
      }
      itemsRef.current = snapshot;
      indexRef.current = nextIndex;
      openRef.current = true;
      setItems(snapshot);
      setIndex(nextIndex);
      setOpen(true);
      const item = snapshot[nextIndex];
      if (item) {
        onOpen?.(item, nextIndex, snapshot.length);
      }
    },
    [onOpen],
  );

  const close = useCallback(() => {
    if (openRef.current) {
      const currentItems = itemsRef.current;
      const currentIndex = indexRef.current;
      onClose?.(currentItems[currentIndex], currentIndex);
    }
    openRef.current = false;
    setOpen(false);
  }, [onClose]);

  const handleIndexChange = useCallback(
    (nextIndex: number) => {
      indexRef.current = nextIndex;
      setIndex(nextIndex);
      if (!openRef.current) {
        return;
      }
      const currentItems = itemsRef.current;
      const item = currentItems[nextIndex];
      if (item) {
        onNavigate?.(item, nextIndex, currentItems.length);
      }
    },
    [onNavigate],
  );

  const isOpen = open && items.length > 0;

  const value = useMemo<LightboxGalleryValue>(
    () => ({ openAt, registerItem }),
    [openAt, registerItem],
  );

  return (
    <LightboxGalleryContext.Provider value={value}>
      {children}
      <Lightbox
        open={isOpen}
        items={items}
        index={index}
        onClose={close}
        onIndexChange={handleIndexChange}
      />
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
