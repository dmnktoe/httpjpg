"use client";

import { Box } from "@httpjpg/ui";
import { useCallback, useSyncExternalStore } from "react";

import type { RelatedWorkItem } from "@/lib/queries/related-work";

import { RelatedWorkCard } from "./related-work-card";
import { RelatedWorkLabel } from "./related-work-label";
import { RelatedWorkRow } from "./related-work-row";
import {
  RELATED_WORK_VIEWS,
  RelatedWorkViewToggle,
  type RelatedWorkView,
} from "./related-work-view-toggle";

const STORAGE_KEY = "httpjpg:related-work-view";

const DEFAULT_VIEW: RelatedWorkView = "list";

const listeners = new Set<() => void>();
let cachedView: RelatedWorkView | null = null;

export interface RelatedWorkGalleryProps {
  items: RelatedWorkItem[];
}

export function RelatedWorkGallery({ items }: RelatedWorkGalleryProps) {
  const view = useSyncExternalStore(subscribeView, getViewSnapshot, getServerView);

  const handleChange = useCallback((next: RelatedWorkView) => {
    writeStoredView(next);
  }, []);

  return (
    <Box>
      <Box css={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <RelatedWorkLabel>related</RelatedWorkLabel>
        <RelatedWorkViewToggle view={view} onChange={handleChange} />
      </Box>

      {view === "grid" ? (
        <Box
          as="ul"
          css={{
            display: "grid",
            gridTemplateColumns: { base: "1fr", md: "repeat(3, 1fr)" },
            gap: "6",
            mt: "3",
            listStyle: "none",
          }}
        >
          {items.map((item) => (
            <RelatedWorkCard key={item.id} {...item} />
          ))}
        </Box>
      ) : (
        <Box as="ul" css={{ mt: "3", listStyle: "none" }}>
          {items.map((item) => (
            <RelatedWorkRow key={item.id} {...item} />
          ))}
        </Box>
      )}
    </Box>
  );
}

function subscribeView(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function getViewSnapshot(): RelatedWorkView {
  cachedView ??= readStoredView() ?? DEFAULT_VIEW;
  return cachedView;
}

function getServerView(): RelatedWorkView {
  return DEFAULT_VIEW;
}

function isView(value: string | null): value is RelatedWorkView {
  return RELATED_WORK_VIEWS.includes(value as RelatedWorkView);
}

function readStoredView(): RelatedWorkView | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isView(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeStoredView(view: RelatedWorkView) {
  try {
    window.localStorage.setItem(STORAGE_KEY, view);
  } catch {
    // Quota or private-mode failures are non-fatal.
  }
  cachedView = view;
  for (const listener of listeners) {
    listener();
  }
}
