"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useHasMounted } from "../../lib/use-has-mounted";
import {
  DRAFT_STATUS_ACTION,
  editBadgeAction,
  EXIT_DRAFT_ACTION,
  gridBadgeAction,
  previewBadgeAction,
} from "./editor-badge-actions";
import { EditorGridOverlay } from "./editor-grid-overlay";
import { FloatingPreviewBadge } from "./floating-preview-badge";

export interface EditorChromeProps {
  /** Content concern: work page live URL. Omit when the story has no link. */
  previewHref?: string | null;
  previewLabel?: string;
  /** CMS concern: Visual Editor deep-link from `_editable`. */
  editHref?: string | null;
  /** Tints the preview pill only. Editor tools stay on the default glass. */
  accentColor?: string | null;
}

/**
 * Draft / Visual Editor chrome. Owns draft, exit, grid, and optional edit.
 * Preview is only forwarded when the page published a live URL.
 */
export function EditorChrome({
  previewHref,
  previewLabel = "preview",
  editHref,
  accentColor,
}: EditorChromeProps) {
  const mounted = useHasMounted();
  const [gridOpen, setGridOpen] = useState(false);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (isTypingTarget(event.target)) {
        return;
      }
      if (event.key === "Escape") {
        setGridOpen(false);
        return;
      }
      if (event.key === "g" || event.key === "G") {
        event.preventDefault();
        setGridOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <FloatingPreviewBadge
        accentColor={accentColor}
        actions={[
          DRAFT_STATUS_ACTION,
          ...(previewHref ? [previewBadgeAction(previewHref, previewLabel)] : []),
          ...(editHref ? [editBadgeAction(editHref)] : []),
          EXIT_DRAFT_ACTION,
          gridBadgeAction(gridOpen, () => setGridOpen((open) => !open)),
        ]}
      />
      {mounted && gridOpen ? createPortal(<EditorGridOverlay />, document.body) : null}
    </>
  );
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}
