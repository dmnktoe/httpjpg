"use client";

import { zIndex } from "@httpjpg/tokens";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export interface CustomCursorProps {
  size?: number;
  color?: string;
  showLabel?: boolean;
  symbol?: string;
  css?: SystemStyleObject;
}

export function CustomCursor({
  size = 24,
  color = "var(--colors-page-fg)",
  showLabel = true,
  symbol = "✦",
  css: cssProp,
}: CustomCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const [hoverText, setHoverText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const symbols = ["✦", "◆", "✧", "◇", "⬥", "⬦"];
    let symbolIndex = 0;
    let rafId: number | null = null;
    let lastX = -100;
    let lastY = -100;
    let hasShown = false;
    let lastInteractive: Element | null = null;

    const apply = () => {
      rafId = null;
      const cursor = cursorRef.current;
      if (cursor) {
        cursor.style.transform = `translate3d(${lastX}px, ${lastY}px, 0) translate(-50%, -50%)`;
        if (!hasShown) {
          cursor.style.opacity = "1";
          hasShown = true;
        }
      }
      const label = labelRef.current;
      if (label) {
        label.style.transform = `translate3d(${lastX}px, ${lastY}px, 0) translate(-50%, calc(-100% - 30px))`;
      }
    };

    const moveCursor = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafId === null) {
        rafId = requestAnimationFrame(apply);
      }
    };

    const INTERACTIVE_SELECTOR =
      'a, button, [data-cursor], input, textarea, select, [role="button"], [draggable="true"], [data-draggable="true"]';

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) {
        return;
      }
      const draggableEl = target.closest('[data-draggable="true"], [draggable="true"]');
      if (draggableEl) {
        if (draggableEl === lastInteractive) {
          return;
        }
        lastInteractive = draggableEl;
        setCurrentSymbol("👋");
        setIsDragging(true);
        setHoverText("");
        return;
      }

      const interactive = target.closest(INTERACTIVE_SELECTOR);
      if (interactive) {
        if (interactive === lastInteractive) {
          return;
        }
        lastInteractive = interactive;
        setIsDragging(false);
        const cursorAttr = interactive.getAttribute("data-cursor");
        if (cursorAttr !== null) {
          setHoverText(cursorAttr);
        } else {
          setHoverText("");
        }
        symbolIndex = (symbolIndex + 1) % symbols.length;
        setCurrentSymbol(symbols[symbolIndex]);
        return;
      }

      if (lastInteractive !== null) {
        lastInteractive = null;
        setCurrentSymbol(symbol);
        setHoverText("");
        setIsDragging(false);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (e.relatedTarget === null || (e.relatedTarget as HTMLElement)?.nodeName === "HTML") {
        if (cursorRef.current) {
          cursorRef.current.style.opacity = "0";
        }
        hasShown = false;
        lastInteractive = null;
        setCurrentSymbol(symbol);
        setHoverText("");
        setIsDragging(false);
      }
    };

    window.addEventListener("mousemove", moveCursor, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, [symbol, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    document.body.style.cursor = "none";
    document.documentElement.style.cursor = "none";

    const style = document.createElement("style");
    style.innerHTML = `
      *,
      *::before,
      *::after {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.style.cursor = "";
      document.documentElement.style.cursor = "";
      style.remove();
    };
  }, [prefersReducedMotion]);

  // Reduced motion: keep the native cursor rather than the animated custom one.
  if (prefersReducedMotion) {
    return null;
  }

  return (
    <>
      <Box
        ref={cursorRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: zIndex.cursor,
          transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
          opacity: 0,
          fontSize: isDragging ? `${size * 1.2}px` : `${size}px`,
          color,
          fontWeight: "bold",
          userSelect: "none",
          willChange: "transform",
          backfaceVisibility: "hidden",
          transition: "font-size 0.15s ease-out",
        }}
        css={cssProp}
      >
        {currentSymbol}
      </Box>

      {showLabel && hoverText && (
        <Box
          ref={labelRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: zIndex.cursor,
            transform: "translate3d(-100px, -100px, 0) translate(-50%, calc(-100% - 30px))",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
          css={{
            px: "3",
            py: "1.5",
            color: "pageBg",
            fontFamily: "mono",
            fontSize: "sm",
            letterSpacing: "wider",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            bg: "pageFg",
          }}
        >
          {hoverText}
        </Box>
      )}
    </>
  );
}
