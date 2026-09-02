"use client";

import { useEffect, useSyncExternalStore } from "react";

import { editorBadgeActions } from "./editor-badge-actions";
import { FloatingPreviewBadge } from "./floating-preview-badge";
import {
  getPreviewBadgeHosted,
  setPreviewBadgeSlot,
  subscribePreviewBadge,
} from "./preview-badge-store";

export interface PreviewBadgeBridgeProps {
  previewHref?: string | null;
  editHref?: string | null;
  accentColor?: string | null;
}

function getServerFalse() {
  return false;
}

/**
 * Pages publish slot data to the layout host (`PreviewNotification`).
 * Without a host (tests, Storybook) this renders the badge itself.
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
    return (
      <FloatingPreviewBadge
        href={previewHref ?? undefined}
        accentColor={accentColor}
        gridToggle
        actions={editorBadgeActions(editHref)}
      />
    );
  }

  if (previewHref) {
    return <FloatingPreviewBadge href={previewHref} accentColor={accentColor} />;
  }

  return null;
}
