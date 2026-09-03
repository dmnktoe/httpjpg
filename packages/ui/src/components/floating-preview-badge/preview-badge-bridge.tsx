"use client";

import { useEffect, useSyncExternalStore } from "react";

import { EditorChrome } from "./editor-chrome";
import { FloatingPreviewBadge } from "./floating-preview-badge";
import {
  getPreviewBadgeHosted,
  setPreviewBadgeSlot,
  subscribePreviewBadge,
} from "./preview-badge-store";

export interface PreviewBadgeBridgeProps {
  /** Work-page live URL. Content-owned. */
  previewHref?: string | null;
  /** Visual Editor href from `_editable`. Not a work-link. */
  editHref?: string | null;
  accentColor?: string | null;
}

function getServerFalse() {
  return false;
}

/**
 * Pages publish content/CMS slot data to the layout `EditorChrome` host.
 * Without a host: published work renders only the preview pill; draft
 * fallbacks render `EditorChrome` (tests / Storybook).
 */
export function PreviewBadgeBridge({
  previewHref,
  editHref,
  accentColor,
}: PreviewBadgeBridgeProps) {
  const hosted = useSyncExternalStore(subscribePreviewBadge, getPreviewBadgeHosted, getServerFalse);

  useEffect(() => {
    setPreviewBadgeSlot({
      previewHref: previewHref ?? undefined,
      editHref,
      accentColor,
    });
    return () => setPreviewBadgeSlot({});
  }, [previewHref, editHref, accentColor]);

  if (hosted) {
    return null;
  }

  if (editHref) {
    return <EditorChrome previewHref={previewHref} editHref={editHref} accentColor={accentColor} />;
  }

  if (previewHref) {
    return <FloatingPreviewBadge href={previewHref} accentColor={accentColor} />;
  }

  return null;
}
