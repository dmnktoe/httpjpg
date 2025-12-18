"use client";

import { Marquee } from "@httpjpg/ui";
import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { type ExtractedColor, extractVibrantColor } from "./extract-color";

export interface NowPlayingProps {
  /**
   * Song title
   */
  title?: string;
  /**
   * Artist name
   */
  artist?: string;
  /**
   * Album artwork URL
   */
  artwork?: string;
  /**
   * Whether the track is currently playing
   * @default false
   */
  isPlaying?: boolean;
  /**
   * Show loading state
   * @default false
   */
  isLoading?: boolean;
  /**
   * Automatically extract vibrant color from artwork
   * @default true
   */
  autoExtractColor?: boolean;
  /**
   * Manual vibrant color override (disables autoExtractColor)
   * If provided, uses this instead of auto-extraction
   */
  vibrantColor?: string;
  /**
   * Manual text color override (disables auto-extraction)
   * @default "white"
   */
  textColor?: "black" | "white";
  /**
   * Size of the widget
   * @default "sm"
   */
  size?: "sm" | "md" | "lg";
}

interface MarqueeTextProps {
  children: string;
  speed?: number;
}

const MarqueeText = React.memo(({ children, speed = 10 }: MarqueeTextProps) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(true);
  const [currentText, setCurrentText] = useState(children);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Force re-measurement when text changes
    if (currentText !== children) {
      setCurrentText(children);
      setIsMeasuring(true);
      setShouldAnimate(false);
    }

    const checkOverflow = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        const needsMarquee = textWidth > containerWidth;
        setShouldAnimate(needsMarquee);
        setIsMeasuring(false);
      }
    };

    // Delay to ensure proper measurement after render
    const timeoutId = setTimeout(checkOverflow, 100);
    window.addEventListener("resize", checkOverflow);
    return () => {
      window.removeEventListener("resize", checkOverflow);
      clearTimeout(timeoutId);
    };
  }, [children, currentText]);

  // Show static text while measuring or if no animation needed
  if (isMeasuring || !shouldAnimate) {
    return (
      <div
        ref={containerRef}
        style={{
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <div ref={textRef}>{children}</div>
      </div>
    );
  }

  // Show marquee animation
  return (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        maskImage: "linear-gradient(to right, black 94%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, black 94%, transparent)",
      }}
    >
      <Marquee speed={speed} iosStyle pauseDuration={2}>
        {children}
      </Marquee>
    </div>
  );
});

MarqueeText.displayName = "MarqueeText";

const sizeConfig = {
  sm: {
    width: 240,
    height: 56,
    artworkSize: 40,
    fontSize: { title: "0.75rem", artist: "0.6875rem" },
    padding: 8,
    gap: 8,
  },
  md: {
    width: 280,
    height: 64,
    artworkSize: 48,
    fontSize: { title: "0.875rem", artist: "0.75rem" },
    padding: 8,
    gap: 10,
  },
  lg: {
    width: 320,
    height: 72,
    artworkSize: 56,
    fontSize: { title: "1rem", artist: "0.875rem" },
    padding: 10,
    gap: 12,
  },
};

/**
 * A draggable floating "Now Playing" widget inspired by Spotify.
 *
 * Features glassmorphism design with vibrant colors extracted from artwork,
 * crisp album artwork, and iOS-style marquee for long text overflow.
 * Draggable with react-draggable.
 *
 * @example
 * ```tsx
 * <NowPlaying
 *   title="Blinding Lights"
 *   artist="The Weeknd"
 *   artwork="/artwork.jpg"
 *   isPlaying={true}
 * />
 * ```
 */
export const NowPlaying = ({
  title,
  artist,
  artwork,
  isPlaying = false,
  isLoading = false,
  autoExtractColor = true,
  vibrantColor,
  textColor,
  size = "sm",
}: NowPlayingProps) => {
  const config = sizeConfig[size];
  const nodeRef = useRef<HTMLDivElement>(null);

  // Internal color extraction state
  const [extractedColor, setExtractedColor] = useState<ExtractedColor | null>(
    null,
  );
  const [currentArtwork, setCurrentArtwork] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);

  // Extract color from artwork when it changes
  useEffect(() => {
    if (!autoExtractColor || vibrantColor || !artwork) {
      return;
    }
    if (artwork === currentArtwork) {
      return;
    }

    setCurrentArtwork(artwork);
    setIsExtracting(true);

    extractVibrantColor(artwork).then((color) => {
      if (color) {
        setExtractedColor(color);
        setTimeout(() => setIsExtracting(false), 100);
      } else {
        setIsExtracting(false);
      }
    });
  }, [artwork, currentArtwork, autoExtractColor, vibrantColor]);

  // Determine final colors: manual override > auto-extracted > defaults
  const finalVibrantColor = vibrantColor || extractedColor?.rgba;
  const finalTextColor = textColor || extractedColor?.textColor || "white";

  // Determine glow color
  const hasVibrantColor = !!finalVibrantColor && !isExtracting;
  const glowColor = hasVibrantColor
    ? finalVibrantColor
    : "rgba(163, 163, 163, 0.6)";

  return (
    <>
      <style>
        {`
          @keyframes skeleton-shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          .sparkle-1 {
            display: inline-block;
            animation: sparkle-1 0.6s ease-in-out infinite;
          }
          @keyframes sparkle-1 {
            0%, 100% {
              transform: scale(1) rotate(0deg);
            }
            50% {
              transform: scale(1.3) rotate(10deg);
            }
          }
          .sparkle-2 {
            display: inline-block;
            animation: sparkle-2 0.8s ease-in-out infinite;
            animation-delay: 0.1s;
          }
          @keyframes sparkle-2 {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
            }
            50% {
              transform: translateY(-3px) rotate(-15deg);
            }
          }
          .sparkle-3 {
            display: inline-block;
            animation: sparkle-3 0.7s ease-in-out infinite;
            animation-delay: 0.2s;
          }
          @keyframes sparkle-3 {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.4);
              opacity: 0.6;
            }
          }
        `}
      </style>
      <Draggable nodeRef={nodeRef} cancel=".no-drag">
        <div
          ref={nodeRef}
          data-draggable="true"
          style={{
            position: "fixed",
            bottom: 40,
            right: 40,
            width: config.width,
            height: config.height,
            cursor: "grab",
            touchAction: "none",
            userSelect: "none",
          }}
        >
          {/* Blurred background layer - vibrant color, Spotify green, or neutral gray */}
          <div
            style={{
              position: "absolute",
              inset: "-3px",
              background: glowColor,
              filter: "blur(8px)",
              borderRadius: "9999px",
              boxShadow: hasVibrantColor
                ? `0 0 25px 0 ${finalVibrantColor?.replace("0.9)", "0.4)")}, 0 0 50px 0 ${finalVibrantColor?.replace("0.9)", "0.2)")}`
                : "0 0 15px 0 rgba(163, 163, 163, 0.3)",
              zIndex: -1,
              transition:
                "background 0.6s ease-in-out, box-shadow 0.6s ease-in-out",
            }}
          />

          {/* Content container */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              gap: config.gap,
              padding: config.padding,
              borderRadius: "9999px",
              overflow: "hidden",
              isolation: "isolate",
            }}
          >
            {/* Album artwork - crisp, no blur (or skeleton) */}
            <div
              style={{
                width: config.artworkSize,
                height: config.artworkSize,
                flexShrink: 0,
                borderRadius: "9999px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                backgroundImage: isLoading
                  ? "linear-gradient(90deg, rgba(163, 163, 163, 0.8) 0%, rgba(200, 200, 200, 0.8) 50%, rgba(163, 163, 163, 0.8) 100%)"
                  : undefined,
                backgroundSize: "200% 100%",
                animation: isLoading
                  ? "skeleton-shimmer 2s ease-in-out infinite"
                  : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoading ? (
                <span style={{ fontSize: "1.5rem", opacity: 0.5 }}>♪</span>
              ) : (
                <img
                  src={artwork}
                  alt={`${title} artwork`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  draggable={false}
                />
              )}
            </div>

            {/* Text content with marquee (or skeleton) */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: isLoading ? 6 : 2,
                color: finalTextColor,
                transition: "color 0.6s ease-in-out",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              {isLoading ? (
                <>
                  <div
                    style={{
                      height: config.fontSize.title,
                      width: "80%",
                      borderRadius: "4px",
                      background:
                        "linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.3) 100%)",
                      backgroundSize: "200% 100%",
                      animation: "skeleton-shimmer 2s ease-in-out infinite",
                    }}
                  />
                  <div
                    style={{
                      height: config.fontSize.artist,
                      width: "60%",
                      borderRadius: "4px",
                      background:
                        "linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.2) 100%)",
                      backgroundSize: "200% 100%",
                      animation: "skeleton-shimmer 2s ease-in-out infinite",
                    }}
                  />
                </>
              ) : (
                <>
                  <div
                    style={{ fontSize: config.fontSize.title, fontWeight: 600 }}
                  >
                    <MarqueeText>{title || ""}</MarqueeText>
                  </div>
                  <div
                    style={{ fontSize: config.fontSize.artist, opacity: 0.9 }}
                  >
                    <MarqueeText speed={25}>{artist || ""}</MarqueeText>
                  </div>
                </>
              )}
            </div>

            {/* Playing indicator - ASCII animation */}
            {isPlaying && (
              <div
                style={{
                  flexShrink: 0,
                  marginRight: 4,
                  fontSize: config.fontSize.title,
                  lineHeight: 1,
                  color: finalTextColor,
                  display: "flex",
                  alignItems: "center",
                  gap: "1px",
                }}
              >
                <span className="sparkle-1">⋆</span>
                <span className="sparkle-2">˚</span>
                <span className="sparkle-3">✮</span>
              </div>
            )}
          </div>
        </div>
      </Draggable>
    </>
  );
};
