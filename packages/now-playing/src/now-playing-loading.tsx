"use client";

import { m } from "framer-motion";

export interface NowPlayingLoadingProps {
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
 * Loading state for NowPlaying widget with skeleton animation
 *
 * @example
 * ```tsx
 * <NowPlayingLoading />
 * ```
 */
export const NowPlayingLoading = ({
  initialPosition = {
    x: typeof window !== "undefined" ? window.innerWidth - 280 : 20,
    y: 40,
  },
  size = "sm",
  style,
}: NowPlayingLoadingProps) => {
  const config = sizeConfig[size];

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
        `}
      </style>
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
        {/* Blurred background with skeleton animation */}
        <div
          style={{
            position: "absolute",
            inset: "-3px",
            background:
              "linear-gradient(90deg, rgba(163, 163, 163, 0.4) 0%, rgba(163, 163, 163, 0.6) 50%, rgba(163, 163, 163, 0.4) 100%)",
            backgroundSize: "200% 100%",
            filter: "blur(8px)",
            borderRadius: "9999px",
            boxShadow: "0 0 15px 0 rgba(163, 163, 163, 0.3)",
            zIndex: -1,
            animation: "skeleton-shimmer 2s ease-in-out infinite",
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
          {/* Artwork skeleton */}
          <div
            style={{
              width: config.artworkSize,
              height: config.artworkSize,
              flexShrink: 0,
              borderRadius: "9999px",
              overflow: "hidden",
              background:
                "linear-gradient(90deg, rgba(163, 163, 163, 0.8) 0%, rgba(200, 200, 200, 0.8) 50%, rgba(163, 163, 163, 0.8) 100%)",
              backgroundSize: "200% 100%",
              animation: "skeleton-shimmer 2s ease-in-out infinite",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            <span style={{ fontSize: "1.5rem", opacity: 0.5 }}>♪</span>
          </div>

          {/* Text content skeleton */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 6,
              color: "white",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {/* Title skeleton */}
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

            {/* Artist skeleton */}
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
          </div>
        </div>
      </m.div>
    </>
  );
};
