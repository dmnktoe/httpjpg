import { useSyncExternalStore } from "react";

/** Device-local only: never sent anywhere, and a cleared or blocked store just starts empty. */
const STORAGE_KEY = "httpjpg.recent-searches";
const MAX_RECENT = 6;
const NONE: string[] = [];

const listeners = new Set<() => void>();
let snapshotRaw: string | null = null;
let snapshot: string[] = NONE;

/** Queries that led somewhere (a result opened or a question asked), newest first. */
export function useRecentSearches(): string[] {
  return useSyncExternalStore(subscribe, readRecentSearches, () => NONE);
}

/** Cached by the stored string, so an unchanged store hands React the same array. */
export function readRecentSearches(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    snapshot = parse(raw);
  }
  return snapshot;
}

/** Moves `query` to the front, deduplicated case-insensitively. */
export function rememberSearch(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) {
    return;
  }
  const key = trimmed.toLowerCase();
  write(
    [trimmed, ...readRecentSearches().filter((entry) => entry.toLowerCase() !== key)].slice(
      0,
      MAX_RECENT,
    ),
  );
}

export function clearRecentSearches(): void {
  write(NONE);
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  // Another tab's search shows up here too.
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function parse(raw: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string").slice(0, MAX_RECENT)
      : NONE;
  } catch {
    return NONE;
  }
}

function write(entries: string[]): void {
  try {
    if (entries.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  } catch {
    // Quota or private-mode failures only cost the history.
  }
  for (const listener of listeners) {
    listener();
  }
}
