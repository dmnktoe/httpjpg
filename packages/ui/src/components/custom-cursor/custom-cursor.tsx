"use client";

import { useEffect, useState } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

export interface CustomCursorProps {
  /**
   * Cursor size in pixels
   * @default 24
   */
  size?: number;
  /**
   * Cursor color
   * @default "black"
   */
  color?: string;
  /**
   * Show text label on hover
   * @default true
   */
  showLabel?: boolean;
  /**
   * ASCII symbol to use as cursor
   * @default "✦"
   */
  symbol?: string;
  /**
   * Additional styles
   */
  css?: SystemStyleObject;
}

/**
 * Custom Cursor - Brutalist ASCII cursor
 *
 * Replaces default cursor with ASCII symbols that respond to
 * hover states, links, and interactive elements.
 *
 * @example
 * ```tsx
 * // Add to root layout
 * <CustomCursor />
 *
 * // Add labels to elements
 * <button data-cursor="Click me!">Button</button>
 * ```
 */
export function CustomCursor({
  size = 24,
  color = "black",
  showLabel = true,
  symbol = "✦",
  css: cssProp,
}: CustomCursorProps) {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const [hoverText, setHoverText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const symbols = ["✦", "◆", "✧", "◇", "⬥", "⬦"];
    let symbolIndex = 0;
    let rafId: number | null = null;
    let currentX = -100;
    let currentY = -100;

    const moveCursor = (e: MouseEvent) => {
      currentX = e.clientX;
      currentY = e.clientY;

      // Use requestAnimationFrame for smooth 60fps updates
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          setCursorPos({ x: currentX, y: currentY });
          rafId = null;
        });
      }

      if (!isVisible) {
        setIsVisible(true);
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isLink = target.tagName === "A" || target.tagName === "BUTTON";
      const isInteractive =
        target.hasAttribute("data-cursor") ||
        target.closest("[data-cursor]") !== null;
      const isDraggable =
        target.hasAttribute("draggable") ||
        target.hasAttribute("data-draggable") ||
        target.closest("[draggable='true']") !== null ||
        target.closest("[data-draggable='true']") !== null;

      // Show hand cursor for draggable elements
      if (isDraggable) {
        setCurrentSymbol("👋");
        setIsDragging(true);
        return;
      }

      // Change symbol on hover
      if (isLink || isInteractive) {
        symbolIndex = (symbolIndex + 1) % symbols.length;
        setCurrentSymbol(symbols[symbolIndex]);
      } else {
        setCurrentSymbol(symbol);
      }

      // Get hover text
      if (isInteractive) {
        const interactiveElement = target.closest("[data-cursor]") || target;
        const text = interactiveElement.getAttribute("data-cursor") || "";
        setHoverText(text);
      } else {
        setHoverText("");
      }
    };

    const handleMouseLeave = () => {
      setCurrentSymbol(symbol);
      setHoverText("");
      setIsDragging(false);
    };

    // Hide cursor when leaving window
    const handleMouseOut = (e: MouseEvent) => {
      if (
        e.relatedTarget === null ||
        (e.relatedTarget as HTMLElement)?.nodeName === "HTML"
      ) {
        setIsVisible(false);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseout", handleMouseOut);

    // Add event listeners to all interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [data-cursor], input, textarea, select, [role="button"], [draggable="true"], [data-draggable="true"]',
    );

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter as EventListener);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseout", handleMouseOut);

      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter as EventListener);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [isVisible, symbol, isDragging]);

  // Hide default cursor
  useEffect(() => {
    document.body.style.cursor = "none";
    document.documentElement.style.cursor = "none";

    // Apply cursor: none to ALL elements including draggable ones
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
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* ASCII Symbol Cursor */}
      <Box
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 10000,
          transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0) translate(-50%, -50%)`,
          fontSize: isDragging ? `${size * 1.2}px` : `${size}px`,
          color,
          fontWeight: "bold",
          userSelect: "none",
          willChange: "transform",
          // Force hardware acceleration
          backfaceVisibility: "hidden",
          perspective: 1000,
          transition: "font-size 0.15s ease-out",
        }}
        css={cssProp}
      >
        {currentSymbol}
      </Box>

      {/* Hover Text Label */}
      {showLabel && hoverText && (
        <Box
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 10000,
            transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0) translate(-50%, calc(-100% - 30px))`,
            willChange: "transform",
            // Force hardware acceleration
            backfaceVisibility: "hidden",
            perspective: 1000,
          }}
          css={{
            bg: "black",
            color: "white",
            px: "12px",
            py: "6px",
            fontSize: "sm",
            fontFamily: "mono",
            textTransform: "uppercase",
            letterSpacing: "wider",
            whiteSpace: "nowrap",
          }}
        >
          {hoverText}
        </Box>
      )}
    </>
  );
}
