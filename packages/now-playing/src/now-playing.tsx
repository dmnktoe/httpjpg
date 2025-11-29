"use client";

import { Marquee } from "@httpjpg/ui";
import { m } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { type ExtractedColor, extractVibrantColor } from "./extract-color";

export interface NowPlayingProps {
  /**
   * Song title
   */
  title: string;
  /**
   * Artist name
   */
  artist: string;
  /**
   * Album artwork URL
   */
  artwork: string;
  /**
   * Whether the track is currently playing
   * @default false
   */
  isPlaying?: boolean;
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
   * Initial position
   * @default { x: 20, y: 20 }
   */
  initialPosition?: { x: number; y: number };
  /**
   * Size of the widget
   * @default "sm"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Additional CSS styles
   */
  style?: React.CSSProperties;
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
        maskImage: "linear-gradient(to right, black 95%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, black 95%, transparent)",
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
 * Features glassmorphism design with Spotify's signature green (#1DB954),
 * crisp album artwork, and iOS-style marquee for long text overflow.
 * Fully draggable with smooth animations powered by Framer Motion.
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
  autoExtractColor = true,
  vibrantColor,
  textColor,
  initialPosition = {
    x: typeof window !== "undefined" ? window.innerWidth - 280 : 20,
    y: 40,
  },
  size = "sm",
  style,
}: NowPlayingProps) => {
  const config = sizeConfig[size];

  // Internal color extraction state
  const [extractedColor, setExtractedColor] = useState<ExtractedColor | null>(
    null,
  );
  const [currentArtwork, setCurrentArtwork] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);

  // Extract color from artwork when it changes
  useEffect(() => {
    if (!autoExtractColor || vibrantColor) {
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
        // Small delay before showing the color to allow smooth transition
        setTimeout(() => setIsExtracting(false), 100);
      } else {
        setIsExtracting(false);
      }
    });
  }, [artwork, currentArtwork, autoExtractColor, vibrantColor]);

  // Determine final colors: manual override > auto-extracted > defaults
  const finalVibrantColor = vibrantColor || extractedColor?.rgba;
  const finalTextColor = textColor || extractedColor?.textColor || "white";

  // Determine glow color: vibrantColor > neutral gray (no Spotify green)
  const hasVibrantColor = !!finalVibrantColor && !isExtracting;
  const glowColor = hasVibrantColor
    ? finalVibrantColor
    : "rgba(163, 163, 163, 0.6)";

  return (
    <m.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      initial={initialPosition}
      data-draggable="true"
      style={{
        position: "fixed",
        width: config.width,
        height: config.height,
        cursor: "grab",
        zIndex: 10000,
        touchAction: "none",
        userSelect: "none",
        ...style,
      }}
      whileDrag={{
        cursor: "grabbing",
        scale: 1.05,
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
        {/* Album artwork - crisp, no blur */}
        <div
          style={{
            width: config.artworkSize,
            height: config.artworkSize,
            flexShrink: 0,
            borderRadius: "9999px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
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
        </div>

        {/* Text content with marquee */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 2,
            color: finalTextColor,
            transition: "color 0.6s ease-in-out",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div style={{ fontSize: config.fontSize.title, fontWeight: 600 }}>
            <MarqueeText>{title}</MarqueeText>
          </div>

          <div style={{ fontSize: config.fontSize.artist, opacity: 0.9 }}>
            <MarqueeText speed={25}>{artist}</MarqueeText>
          </div>
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
            }}
          >
            <m.span
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              style={{
                display: "inline-block",
              }}
            >
              ⋆
            </m.span>
            <m.span
              animate={{
                y: [0, -3, 0],
                rotate: [0, -15, 15, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.1,
              }}
              style={{
                display: "inline-block",
              }}
            >
              ˚
            </m.span>
            <m.span
              animate={{
                scale: [1, 1.4, 1],
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 0.7,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.2,
              }}
              style={{
                display: "inline-block",
              }}
            >
              ✮
            </m.span>
          </div>
        )}
      </div>
    </m.div>
  );
};
