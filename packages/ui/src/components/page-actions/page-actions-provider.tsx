"use client";

import { type ReactNode, useState } from "react";

import type { PageActionsProps } from "./page-actions";
import { PageActionsBar } from "./page-actions-bar";
import { PageActionsContext } from "./page-actions-context";

export interface PageActionsProviderProps {
  children?: ReactNode;
  /** Draft Mode is on. Draft tools also show whenever the page publishes an `editHref`. */
  draft?: boolean;
  /** Rendered inside the Storyblok Visual Editor iframe. */
  inEditor?: boolean;
}

/**
 * Owns the page's one `FloatingActionBar`: merges what `PageActions` publishes
 * with the draft tools. Mount once in the root layout.
 */
export function PageActionsProvider({
  children,
  draft = false,
  inEditor = false,
}: PageActionsProviderProps) {
  const [slot, setSlot] = useState<PageActionsProps | null>(null);
  return (
    <PageActionsContext.Provider value={setSlot}>
      {children}
      <PageActionsBar {...slot} draft={draft} inEditor={inEditor} />
    </PageActionsContext.Provider>
  );
}
