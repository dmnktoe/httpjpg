"use client";

import { useEffect, useState } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

export interface ScrollProgressProps {
  /**
   * Show percentage indicator
   * @default true
   */
  showPercentage?: boolean;
  /**
   * Progress bar height in pixels
   * @default 8
   */
  height?: number;
  /**
   * Progress bar color
   * @default "black"
   */
  color?: string;
  /**
   * Background color
   * @default "white"
   */
  backgroundColor?: string;
  /**
   * Position
   * @default "top"
   */
  position?: "top" | "bottom";
  /**
   * ASCII style progress bar
   * @default true
   */
  asciiStyle?: boolean;
  /**
   * Additional styles
   */
  css?: SystemStyleObject;
}

/**
 * Scroll Progress - Reading progress indicator
 *
 * Brutalist progress bar that shows reading progress.
 * Can display as chunky bar or ASCII-style indicator.
 *
 * @example
 * ```tsx
 * // Add to layout
 * <ScrollProgress />
 *
 * // ASCII style with percentage
 * <ScrollProgress asciiStyle showPercentage />
 * ```
 */
export function ScrollProgress({
  showPercentage = true,
  height = 8,
  color = "black",
  backgroundColor = "white",
  position = "top",
  asciiStyle = true,
  css: cssProp,
}: ScrollProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      const maxScroll = documentHeight - windowHeight;
      const scrollPercentage =
        maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

      setProgress(Math.min(Math.round(scrollPercentage), 100));
    };

    handleScroll(); // Initial calculation
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const getASCIIBar = (percent: number) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round((percent / 100) * totalBlocks);
    const filled = "█".repeat(filledBlocks);
    const empty = "░".repeat(totalBlocks - filledBlocks);
    return `[${filled}${empty}]`;
  };

  if (asciiStyle) {
    return (
      <Box
        css={{
          position: "fixed",
          [position]: 0,
          left: 0,
          right: 0,
          zIndex: 9998,
          bg: backgroundColor,
          borderBottom: position === "top" ? "2px solid black" : "none",
          borderTop: position === "bottom" ? "2px solid black" : "none",
          py: "2",
          px: "4",
          display: "flex",
          alignItems: "center",
          gap: "3",
          fontFamily: "monospace",
          fontSize: "sm",
          fontWeight: "bold",
          ...cssProp,
        }}
      >
        <Box as="span" css={{ letterSpacing: "0.05em" }}>
          {getASCIIBar(progress)}
        </Box>
        {showPercentage && (
          <Box as="span" css={{ minW: "12", textAlign: "right" }}>
            {progress}%
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      css={{
        position: "fixed",
        [position]: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        ...cssProp,
      }}
    >
      {/* Background */}
      <Box
        css={{
          h: `${height}px`,
          bg: backgroundColor,
          borderBottom: position === "top" ? "2px solid black" : "none",
          borderTop: position === "bottom" ? "2px solid black" : "none",
        }}
      >
        {/* Progress Bar */}
        <Box
          css={{
            h: "100%",
            bg: color,
            transition: "width 100ms ease-out",
          }}
          style={{
            width: `${progress}%`,
          }}
        />
      </Box>

      {/* Percentage */}
      {showPercentage && (
        <Box
          css={{
            position: "absolute",
            top: position === "top" ? "100%" : "auto",
            bottom: position === "bottom" ? "100%" : "auto",
            right: "4",
            mt: position === "top" ? "2" : "0",
            mb: position === "bottom" ? "2" : "0",
            px: "2",
            py: "1",
            bg: "white",
            border: "2px solid black",
            fontFamily: "monospace",
            fontSize: "xs",
            fontWeight: "bold",
          }}
        >
          {progress}%
        </Box>
      )}
    </Box>
  );
}

ScrollProgress.displayName = "ScrollProgress";
