"use client";

import { useHasMounted } from "@httpjpg/ui";
import { useCallback, useEffect, useReducer, useSyncExternalStore } from "react";

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
  publishSnapshot(state);
}

let cachedSnapshot: StudioState = INITIAL;
let cacheHydrated = false;
const storeListeners = new Set<() => void>();

function publishSnapshot(next: StudioState) {
  cacheHydrated = true;
  if (cachedSnapshot === next) return;
  cachedSnapshot = next;
  for (const listener of storeListeners) listener();
}

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
    publishSnapshot(readStored() ?? INITIAL);
  }
  storeListeners.add(onStoreChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    storeListeners.delete(onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

interface SetOptions {
  transient?: boolean;
}

interface StudioHistory {
  override: StudioState | null;
  past: StudioState[];
  future: StudioState[];
}

const EMPTY_HISTORY: StudioHistory = { override: null, past: [], future: [] };

type HistoryAction =
  | {
      type: "set";
      base: StudioState;
      updater: (prev: StudioState) => StudioState;
      transient: boolean;
    }
  | { type: "replace"; base: StudioState; next: StudioState }
  | { type: "reset"; base: StudioState }
  | { type: "undo"; base: StudioState }
  | { type: "redo"; base: StudioState };

function pushPast(past: StudioState[], entry: StudioState): StudioState[] {
  const next = [...past, entry];
  return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
}

function reduceHistory(history: StudioHistory, action: HistoryAction): StudioHistory {
  const current = history.override ?? action.base;
  switch (action.type) {
    case "set": {
      const next = action.updater(current);
      if (next === current) return history;
      if (action.transient) return { ...history, override: next };
      return { override: next, past: pushPast(history.past, current), future: [] };
    }
    case "replace":
      return { override: action.next, past: pushPast(history.past, current), future: [] };
    case "reset":
      return { override: INITIAL, past: pushPast(history.past, current), future: [] };
    case "undo": {
      const previous = history.past.at(-1);
      if (!previous) return history;
      return {
        override: previous,
        past: history.past.slice(0, -1),
        future: [...history.future, current],
      };
    }
    case "redo": {
      const next = history.future.at(-1);
      if (!next) return history;
      return {
        override: next,
        past: pushPast(history.past, current),
        future: history.future.slice(0, -1),
      };
    }
  }
}

export interface StudioStore {
  state: StudioState;
  set(updater: (prev: StudioState) => StudioState, opts?: SetOptions): void;
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
  const [history, dispatch] = useReducer(reduceHistory, EMPTY_HISTORY);
  const state = history.override ?? persisted;

  useEffect(() => {
    if (ready) writeStored(state);
  }, [state, ready]);

  const set = useCallback(
    (updater: (prev: StudioState) => StudioState, opts: SetOptions = {}) => {
      dispatch({ type: "set", base: persisted, updater, transient: opts.transient ?? false });
    },
    [persisted],
  );

  const replace = useCallback(
    (next: StudioState) => {
      dispatch({ type: "replace", base: persisted, next });
    },
    [persisted],
  );

  const reset = useCallback(() => {
    dispatch({ type: "reset", base: persisted });
  }, [persisted]);

  const undo = useCallback(() => {
    dispatch({ type: "undo", base: persisted });
  }, [persisted]);

  const redo = useCallback(() => {
    dispatch({ type: "redo", base: persisted });
  }, [persisted]);

  return {
    state,
    set,
    replace,
    reset,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    ready,
  };
}
