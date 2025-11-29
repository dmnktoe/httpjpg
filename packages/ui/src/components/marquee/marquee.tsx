"use client";

import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

export interface MarqueeProps {
  /**
   * Text content to scroll
   */
  children: React.ReactNode;
  /**
   * Animation speed in seconds (lower = faster)
   * @default 20
   */
  speed?: number;
  /**
   * Direction of scroll
   * @default "left"
   */
  direction?: "left" | "right";
  /**
   * Pause on hover
   * @default false
   */
  pauseOnHover?: boolean;
  /**
   * Number of times to repeat content
   * @default 3
   */
  repeat?: number;
  /**
   * iOS-style pause at beginning before scrolling
   * @default false
   */
  iosStyle?: boolean;
  /**
   * Pause duration at beginning (in seconds)
   * @default 2
   */
  pauseDuration?: number;
  /**
   * Additional styles
   */
  css?: SystemStyleObject;
}

/**
 * Marquee - Infinite scrolling text
 *
 * Brutalist marquee component for continuous scrolling text.
 * Perfect for announcements, ASCII art, or navigation elements.
 *
 * @example
 * ```tsx
 * <Marquee speed={15} direction="left">
 *   ⋆.˚ ᡣ𐭩 .𖥔˚ WELCOME TO HTTPJPG ⋆.˚✮🎧✮˚.⋆
 * </Marquee>
 * ```
 */
export function Marquee({
  children,
  speed = 20,
  direction = "left",
  pauseOnHover = false,
  repeat = 3,
  iosStyle = false,
  pauseDuration = 2,
  css: cssProp,
}: MarqueeProps) {
  const animationName = `marquee-${Math.random().toString(36).substr(2, 9)}`;
  const animationDirection = direction === "left" ? "normal" : "reverse";

  // Calculate pause percentage for iOS-style animation
  const pausePercent = iosStyle
    ? (pauseDuration / (speed + pauseDuration)) * 100
    : 0;

  return (
    <>
      <style>{`
        @keyframes ${animationName} {
          ${
            iosStyle
              ? `
            0% {
              transform: translateX(0);
            }
            ${pausePercent}% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-${100 / repeat}%);
            }
          `
              : `
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-${100 / repeat}%);
            }
          `
          }
        }
      `}</style>

      <Box
        css={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          position: "relative",
          ...cssProp,
        }}
      >
        <Box
          css={{
            display: "inline-block",
            willChange: "transform",
          }}
          style={{
            animation: `${animationName} ${iosStyle ? speed + pauseDuration : speed}s linear infinite ${animationDirection}`,
            ...(pauseOnHover && {
              animationPlayState: "running",
            }),
          }}
          onMouseEnter={(e) => {
            if (pauseOnHover) {
              e.currentTarget.style.animationPlayState = "paused";
            }
          }}
          onMouseLeave={(e) => {
            if (pauseOnHover) {
              e.currentTarget.style.animationPlayState = "running";
            }
          }}
        >
          {Array.from({ length: repeat }).map((_, i) => (
            <Box
              key={`marquee-item-${i}`}
              as="span"
              css={{
                display: "inline-block",
              }}
            >
              <Box
                as="span"
                css={{
                  display: "inline-block",
                }}
              >
                {children}
              </Box>
              <Box
                as="span"
                css={{
                  display: "inline-block",
                  width: "80px",
                }}
              >
                &nbsp;
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}
