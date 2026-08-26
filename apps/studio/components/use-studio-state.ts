"use client";

import { useHasMounted } from "@httpjpg/ui";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  type BuilderItem,
  emptySpacing,
  GRID_COLS,
  type GridSettings,
  SPACING_SIDES,
  type Viewport,
} from "./lib";

interface StudioState {
  items: BuilderItem[];
  settings: GridSettings;
  viewport: Viewport;
  extraRows: number;
}

const STORAGE_KEY = "httpjpg.studio.grid.v1";
const HISTORY_LIMIT = 50;

const INITIAL: StudioState = {
  items: [],
  settings: {
    columns: GRID_COLS,
    columnsMd: GRID_COLS,
    columnsLg: GRID_COLS,
    gap: "4",
  },
  viewport: "lg",
  extraRows: 0,
};

function migrateItem(raw: Record<string, unknown>): BuilderItem {
  const item = raw as Partial<BuilderItem> & Record<string, unknown>;
  let spacing = item.spacing;
  if (!spacing || typeof spacing !== "object" || !("base" in (spacing as object))) {
    // v1 stored flat mt/mb/ml/mr on the item; lift onto spacing.base.
    spacing = emptySpacing();
    for (const side of SPACING_SIDES) {
      const v = (raw as Record<string, unknown>)[side];
      if (typeof v === "string" && v) spacing.base[side] = v;
    }
  }
  return {
    ...(item as BuilderItem),
    spacing,
  } as BuilderItem;
}

function readStored(): StudioState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StudioState>;
    if (!parsed || !Array.isArray(parsed.items)) return null;
    const items = (parsed.items as unknown as Record<string, unknown>[]).map(migrateItem);
    return { ...INITIAL, ...parsed, items };
  } catch {
    return null;
  }
}

function writeStored(state: StudioState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota or private-mode failures are non-fatal.
  }
}

let cachedSnapshot: StudioState = INITIAL;
let cacheHydrated = false;

function getStoredSnapshot(): StudioState {
  if (typeof window === "undefined") return INITIAL;
  if (!cacheHydrated) {
    cachedSnapshot = readStored() ?? INITIAL;
    cacheHydrated = true;
  }
  return cachedSnapshot;
}

function subscribeStored(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key !== STORAGE_KEY) return;
    cachedSnapshot = readStored() ?? INITIAL;
    onStoreChange();
  }
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

export interface StudioStore {
  state: StudioState;
  set(updater: (prev: StudioState) => StudioState, opts?: { transient?: boolean }): void;
  replace(next: StudioState): void;
  reset(): void;
  undo(): void;
  redo(): void;
  canUndo: boolean;
  canRedo: boolean;
  ready: boolean;
}

export function useStudioState(): StudioStore {
  const ready = useHasMounted();
  const persisted = useSyncExternalStore(subscribeStored, getStoredSnapshot, () => INITIAL);
  const [override, setOverride] = useState<StudioState | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const state = override ?? persisted;

  const past = useRef<StudioState[]>([]);
  const future = useRef<StudioState[]>([]);

  useEffect(() => {
    if (ready) writeStored(state);
  }, [state, ready]);

  const set = useCallback(
    (updater: (prev: StudioState) => StudioState, opts: { transient?: boolean } = {}) => {
      setOverride((prev) => {
        const base = prev ?? persisted;
        const next = updater(base);
        if (next === base) return prev;
        if (!opts.transient) {
          past.current.push(base);
          if (past.current.length > HISTORY_LIMIT) past.current.shift();
          future.current = [];
          setCanUndo(true);
          setCanRedo(false);
        }
        return next;
      });
    },
    [persisted],
  );

  const replace = useCallback(
    (next: StudioState) => {
      setOverride((prev) => {
        const base = prev ?? persisted;
        past.current.push(base);
        if (past.current.length > HISTORY_LIMIT) past.current.shift();
        future.current = [];
        setCanUndo(true);
        setCanRedo(false);
        return next;
      });
    },
    [persisted],
  );

  const reset = useCallback(() => {
    setOverride((prev) => {
      const base = prev ?? persisted;
      past.current.push(base);
      future.current = [];
      setCanUndo(true);
      setCanRedo(false);
      return INITIAL;
    });
  }, [persisted]);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    setOverride((current) => {
      future.current.push(current ?? persisted);
      return prev;
    });
    setCanUndo(past.current.length > 0);
    setCanRedo(true);
  }, [persisted]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    setOverride((current) => {
      past.current.push(current ?? persisted);
      return next;
    });
    setCanUndo(true);
    setCanRedo(future.current.length > 0);
  }, [persisted]);

  return {
    state,
    set,
    replace,
    reset,
    undo,
    redo,
    canUndo,
    canRedo,
    ready,
  };
}
