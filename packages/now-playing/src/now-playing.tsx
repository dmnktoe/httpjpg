"use client";

import { m } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
   * Initial position
   * @default { x: 20, y: 20 }
   */
  initialPosition?: { x: number; y: number };
  /**
   * Size of the widget
   * @default "md"
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

const MarqueeText = ({ children, speed = 30 }: MarqueeTextProps) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        setShouldAnimate(textWidth > containerWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [children]);

  if (!shouldAnimate) {
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

  return (
    <div
      ref={containerRef}
      style={{
        overflow: "hidden",
        position: "relative",
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <m.div
        ref={textRef}
        animate={{
          x: [0, -(textRef.current?.scrollWidth || 0)],
        }}
        transition={{
          duration: (textRef.current?.scrollWidth || 0) / speed,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          repeatDelay: 2,
        }}
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          paddingRight: "2em",
        }}
      >
        {children}
      </m.div>
    </div>
  );
};

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
  initialPosition = { x: 20, y: 20 },
  size = "md",
  style,
}: NowPlayingProps) => {
  const config = sizeConfig[size];

  return (
    <m.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      initial={initialPosition}
      style={{
        position: "fixed",
        width: config.width,
        height: config.height,
        cursor: "grab",
        zIndex: 9999,
        touchAction: "none",
        userSelect: "none",
        ...style,
      }}
      whileDrag={{
        cursor: "grabbing",
        scale: 1.05,
      }}
    >
      {/* Blurred background layer - Spotify green */}
      <div
        style={{
          position: "absolute",
          inset: "-3px",
          background: "rgba(29, 185, 84, 0.9)",
          filter: "blur(8px)",
          borderRadius: "9999px",
          boxShadow:
            "0 0 25px 0 rgba(29, 185, 84, 0.4), 0 0 50px 0 rgba(29, 185, 84, 0.2)",
          zIndex: -1,
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
            color: "white",
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

        {/* Playing indicator */}
        {isPlaying && (
          <div
            style={{
              flexShrink: 0,
              width: 16,
              height: 16,
              marginRight: 4,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 2,
            }}
          >
            {[0, 1, 2].map((i) => (
              <m.div
                key={i}
                animate={{
                  height: ["40%", "100%", "40%"],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
                style={{
                  width: 2,
                  backgroundColor: "white",
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </m.div>
  );
};
