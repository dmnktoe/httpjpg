"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  type BuilderItem,
  emptySpacing,
  GRID_COLS,
  type GridSettings,
  SPACING_SIDES,
  type Viewport,
} from "./lib";

export interface StudioState {
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
  const [state, setState] = useState<StudioState>(INITIAL);
  const [ready, setReady] = useState(false);
  const past = useRef<StudioState[]>([]);
  const future = useRef<StudioState[]>([]);
  const [historyVersion, bumpHistory] = useState(0);

  useEffect(() => {
    const stored = readStored();
    if (stored) setState(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeStored(state);
  }, [state, ready]);

  const set = useCallback(
    (updater: (prev: StudioState) => StudioState, opts: { transient?: boolean } = {}) => {
      setState((prev) => {
        const next = updater(prev);
        if (next === prev) return prev;
        if (!opts.transient) {
          past.current.push(prev);
          if (past.current.length > HISTORY_LIMIT) past.current.shift();
          future.current = [];
          bumpHistory((v) => v + 1);
        }
        return next;
      });
    },
    [],
  );

  const replace = useCallback((next: StudioState) => {
    setState((prev) => {
      past.current.push(prev);
      if (past.current.length > HISTORY_LIMIT) past.current.shift();
      future.current = [];
      bumpHistory((v) => v + 1);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setState((prev) => {
      past.current.push(prev);
      future.current = [];
      bumpHistory((v) => v + 1);
      return INITIAL;
    });
  }, []);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    setState((current) => {
      future.current.push(current);
      return prev;
    });
    bumpHistory((v) => v + 1);
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    setState((current) => {
      past.current.push(current);
      return next;
    });
    bumpHistory((v) => v + 1);
  }, []);

  // historyVersion is read solely to bind canUndo/canRedo recomputation to render cycles
  void historyVersion;

  return {
    state,
    set,
    replace,
    reset,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    ready,
  };
}
