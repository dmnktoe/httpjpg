"use client";

import { Box } from "@httpjpg/ui";
import { useEffect, useState } from "react";

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

export interface RelatedWorkGalleryProps {
  items: RelatedWorkItem[];
}

export function RelatedWorkGallery({ items }: RelatedWorkGalleryProps) {
  const [view, setView] = useState<RelatedWorkView>("grid");

  // Read after mount rather than in the initial state: the server cannot know
  // the stored choice, so a list reader gets one frame of grid instead of a
  // hydration mismatch.
  useEffect(() => {
    const stored = readStoredView();
    if (stored) {
      setView(stored);
    }
  }, []);

  const handleChange = (next: RelatedWorkView) => {
    setView(next);
    writeStoredView(next);
  };

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
}
