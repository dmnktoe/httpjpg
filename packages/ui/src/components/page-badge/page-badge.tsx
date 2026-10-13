"use client";

import { useContext, useEffect } from "react";

import { PageBadgeContext } from "./page-badge-context";
import { PageBadgeRow } from "./page-badge-row";

export interface PageBadgeProps {
  /** Work page live URL (external). */
  href?: string | null;
  /** Visual Editor deep-link; only draft content carries one. */
  editHref?: string | null;
  /** Work page Project Accent Color. Tints the live-URL pill only. */
  accentColor?: string | null;
}

/**
 * Publishes the page's live URL, accent and edit link to the `PageBadgeProvider`
 * row. Without a provider (Storybook, tests) it draws the row itself.
 */
export function PageBadge({ href = null, editHref = null, accentColor = null }: PageBadgeProps) {
  const setSlot = useContext(PageBadgeContext);

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
  return <PageBadgeRow href={href} editHref={editHref} accentColor={accentColor} />;
}
