"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { css } from "styled-system/css";

import { useHasMounted } from "../../lib/use-has-mounted";
import { FloatingBadge, type FloatingBadgeAction } from "./floating-badge";

export interface EditorChromeProps {
  /** Visual Editor deep-link from `_editable`. */
  editHref?: string | null;
}

const DRAFT_STATUS: FloatingBadgeAction = {
  label: "draft",
  glyph: "🔍",
  ariaLabel: "Preview mode — unpublished content",
  presentational: true,
};

const EXIT_DRAFT: FloatingBadgeAction = {
  href: "/api/exit-draft",
  label: "exit",
  glyph: "×",
  ariaLabel: "Exit draft preview",
  external: false,
  hideInIframe: true,
};

/** Draft / edit / exit / grid. No work URL, no accent. */
export function useEditorChrome(editHref?: string | null): {
  actions: FloatingBadgeAction[];
  overlay: ReactNode;
} {
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

  return {
    actions: [
      DRAFT_STATUS,
      ...(editHref
        ? [
            {
              href: editHref,
              label: "edit",
              glyph: "✎",
              ariaLabel: "Edit in Storyblok",
            } satisfies FloatingBadgeAction,
          ]
        : []),
      EXIT_DRAFT,
      {
        label: "grid",
        glyph: "⊞",
        ariaLabel: gridOpen ? "Hide 12-column overlay (G)" : "Show 12-column overlay (G)",
        pressed: gridOpen,
        onClick: () => setGridOpen((open) => !open),
      },
    ],
    overlay: mounted && gridOpen ? createPortal(<GridOverlay />, document.body) : null,
  };
}

export function EditorChrome({ editHref }: EditorChromeProps) {
  const { actions, overlay } = useEditorChrome(editHref);
  return (
    <>
      <FloatingBadge actions={actions} />
      {overlay}
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

function GridOverlay() {
  return (
    <div
      aria-hidden="true"
      data-editor-grid=""
      className={css({
        position: "fixed",
        inset: "0",
        zIndex: "overlay",
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: "4",
        paddingInline: { base: "4", md: "6", lg: "8" },
        pointerEvents: "none",
      })}
    >
      {Array.from({ length: 12 }, (_, index) => (
        <div
          key={index}
          className={css({
            position: "relative",
            height: "100%",
          })}
        >
          <div
            className={css({
              position: "absolute",
              inset: "0",
              opacity: 0.06,
              backgroundColor: "pageFg",
              _pageDark: { opacity: 0.1 },
            })}
          />
          <span
            className={css({
              position: "sticky",
              top: "3",
              display: "block",
              color: "pageFg",
              opacity: 0.45,
              fontFamily: "mono",
              fontSize: "xs",
              letterSpacing: "wider",
              textAlign: "center",
            })}
          >
            {`[ ${String(index + 1).padStart(2, "0")} ]`}
          </span>
        </div>
      ))}
    </div>
  );
}
