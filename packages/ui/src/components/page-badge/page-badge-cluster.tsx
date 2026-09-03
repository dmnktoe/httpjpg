"use client";

import { useEditorChrome } from "../editor-chrome/editor-chrome";
import { FloatingBadge } from "../floating-badge/floating-badge";
import { workPreviewAction } from "../floating-badge/work-preview-action";
import type { PageBadgeSlot } from "./page-badge-store";

/**
 * One pill row: optional work URL (accented) plus draft chrome.
 * Used by the layout host and by `PageBadge` when no host is mounted.
 */
export function PageBadgeCluster({ href, editHref, accentColor }: PageBadgeSlot) {
  const editor = useEditorChrome(editHref);
  return (
    <>
      <FloatingBadge
        accentColor={accentColor}
        actions={[...(href ? [workPreviewAction(href)] : []), ...editor.actions]}
      />
      {editor.overlay}
    </>
  );
}
