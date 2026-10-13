"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { css } from "styled-system/css";

import { useHasMounted } from "../../lib/use-has-mounted";

/** Portalled 12-column overlay with `[ 01 ]` … `[ 12 ]` labels. */
export function PageBadgeGrid() {
  const mounted = useHasMounted();
  if (!mounted) {
    return null;
  }
  return createPortal(<GridColumns />, document.body);
}

/** Overlay toggle: `G` flips it, `Escape` closes it. Off (and closed) while `enabled` is false. */
export function useGridShortcut(enabled: boolean): [open: boolean, toggle: () => void] {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((current) => !current), []);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (isTypingTarget(event.target)) {
        return;
      }
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key === "g" || event.key === "G") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);

  return [enabled && open, toggle];
}

function GridColumns() {
  return (
    <div
      aria-hidden="true"
      data-page-badge-grid=""
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

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}
