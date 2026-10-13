"use client";

import { useContext, useEffect } from "react";

import { PageActionsBar } from "./page-actions-bar";
import { PageActionsContext } from "./page-actions-context";

export interface PageActionsProps {
  /** Work page live URL (external). */
  href?: string | null;
  /** Visual Editor deep-link; only draft content carries one. */
  editHref?: string | null;
  /** Work page Project Accent Color. Tints the live-URL pill only. */
  accentColor?: string | null;
}

/**
 * What a page contributes to the action bar: live URL, accent, edit link.
 * Publishes to `PageActionsProvider`, which renders the `FloatingActionBar`.
 * Without a provider (Storybook, tests) it renders the bar itself.
 */
export function PageActions({
  href = null,
  editHref = null,
  accentColor = null,
}: PageActionsProps) {
  const setSlot = useContext(PageActionsContext);

  useEffect(() => {
    if (!setSlot) {
      return;
    }
    const slot = { href, editHref, accentColor };
    setSlot(slot);
    return () => setSlot((current) => (current === slot ? null : current));
  }, [setSlot, href, editHref, accentColor]);

  if (setSlot) {
    return null;
  }
  return <PageActionsBar href={href} editHref={editHref} accentColor={accentColor} />;
}
