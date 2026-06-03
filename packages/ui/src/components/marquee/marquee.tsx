"use client";

import { useMemo } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  repeat?: number;
  iosStyle?: boolean;
  pauseDuration?: number;
  css?: SystemStyleObject;
}

function hashProps(props: {
  speed: number;
  direction: string;
  repeat: number;
  iosStyle: boolean;
  pauseDuration: number;
}): string {
  const str = JSON.stringify(props);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

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
  const animationName = useMemo(
    () => `marquee-${hashProps({ speed, direction, repeat, iosStyle, pauseDuration })}`,
    [speed, direction, repeat, iosStyle, pauseDuration],
  );

  const animationDirection = direction === "left" ? "normal" : "reverse";

  const pausePercent = iosStyle ? (pauseDuration / (speed + pauseDuration)) * 100 : 0;

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
          onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
            if (pauseOnHover) {
              e.currentTarget.style.animationPlayState = "paused";
            }
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
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
                  width: "20",
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
