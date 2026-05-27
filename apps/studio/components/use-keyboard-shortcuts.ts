"use client";

import { useEffect } from "react";

import {
  type BuilderItem,
  clamp,
  createItemId,
  effectiveColumns,
  effectiveW,
  type GridSettings,
  type Viewport,
} from "./lib";

interface Args {
  selectedId: string | null;
  items: BuilderItem[];
  settings: GridSettings;
  viewport: Viewport;
  setItems(updater: (prev: BuilderItem[]) => BuilderItem[]): void;
  setSelectedId(id: string | null): void;
  onUndo(): void;
  onRedo(): void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function useKeyboardShortcuts({
  selectedId,
  items,
  settings,
  viewport,
  setItems,
  setSelectedId,
  onUndo,
  onRedo,
}: Args): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) onRedo();
        else onUndo();
        return;
      }
      if (mod && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        onRedo();
        return;
      }

      if (isEditableTarget(e.target)) return;
      if (!selectedId) return;
      const item = items.find((it) => it.id === selectedId);
      if (!item) return;

      const cols = effectiveColumns(settings, viewport);

      if (mod && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        const dup: BuilderItem = {
          ...item,
          id: createItemId(),
          data: { ...item.data },
          x: clamp(item.x + 1, 0, cols - effectiveW(item, viewport)),
          y: item.y + 1,
        };
        setItems((prev) => [...prev, dup]);
        setSelectedId(dup.id);
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        setItems((prev) => prev.filter((it) => it.id !== selectedId));
        setSelectedId(null);
        return;
      }

      const step = e.shiftKey ? 4 : 1;
      let dx = 0;
      let dy = 0;
      if (e.key === "ArrowLeft") dx = -step;
      else if (e.key === "ArrowRight") dx = step;
      else if (e.key === "ArrowUp") dy = -step;
      else if (e.key === "ArrowDown") dy = step;
      else return;
      e.preventDefault();

      const w = effectiveW(item, viewport);
      setItems((prev) =>
        prev.map((it) =>
          it.id === selectedId
            ? {
                ...it,
                x: clamp(it.x + dx, 0, Math.max(0, cols - w)),
                y: Math.max(0, it.y + dy),
              }
            : it,
        ),
      );
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, items, settings, viewport, setItems, setSelectedId, onUndo, onRedo]);
}
