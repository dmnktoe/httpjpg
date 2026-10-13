"use client";

import { type ReactNode, useState } from "react";

import type { PageBadgeProps } from "./page-badge";
import { PageBadgeContext } from "./page-badge-context";
import { PageBadgeRow } from "./page-badge-row";

export interface PageBadgeProviderProps {
  children?: ReactNode;
  /** Draft Mode is on. Draft tools also show whenever the page publishes an `editHref`. */
  draft?: boolean;
  /** Rendered inside the Storyblok Visual Editor iframe. */
  inEditor?: boolean;
}

/** One pill row per page. Mount once in the root layout; pages publish via `PageBadge`. */
export function PageBadgeProvider({
  children,
  draft = false,
  inEditor = false,
}: PageBadgeProviderProps) {
  const [slot, setSlot] = useState<PageBadgeProps | null>(null);
  return (
    <PageBadgeContext.Provider value={setSlot}>
      {children}
      <PageBadgeRow {...slot} draft={draft} inEditor={inEditor} />
    </PageBadgeContext.Provider>
  );
}
