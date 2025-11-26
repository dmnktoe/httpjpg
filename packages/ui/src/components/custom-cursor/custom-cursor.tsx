"use client";

import { m, useMotionValue } from "framer-motion";
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
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const [hoverText, setHoverText] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const symbols = ["✦", "◆", "✧", "◇", "⬥", "⬦"];
    let symbolIndex = 0;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

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
      'a, button, [data-cursor], input, textarea, select, [role="button"]',
    );

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter as EventListener);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseout", handleMouseOut);

      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter as EventListener);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [cursorX, cursorY, isVisible]);

  // Hide default cursor
  useEffect(() => {
    document.body.style.cursor = "none";
    document.documentElement.style.cursor = "none";

    // Apply cursor: none to all elements
    const style = document.createElement("style");
    style.innerHTML = `
      *, *::before, *::after {
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
        as={m.div}
        style={{
          x: cursorX,
          y: cursorY,
        }}
        css={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 10000,
          transform: "translate(-50%, -50%)",
          fontSize: `${size}px`,
          color,
          fontWeight: "bold",
          mixBlendMode: "difference",
          userSelect: "none",
          ...cssProp,
        }}
      >
        {currentSymbol}
      </Box>

      {/* Hover Text Label */}
      {showLabel && hoverText && (
        <Box
          as={m.div}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            x: cursorX,
            y: cursorY,
          }}
          css={{
            position: "fixed",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 9998,
            transform: "translate(-50%, calc(-100% - 30px))",
            bg: "black",
            color: "white",
            px: "12px",
            py: "6px",
            fontSize: "sm",
            fontFamily: "mono",
            textTransform: "uppercase",
            letterSpacing: "wider", // token: typography.letterSpacing.wider (0.05em)
            whiteSpace: "nowrap",
          }}
        >
          {hoverText}
        </Box>
      )}
    </>
  );
}
