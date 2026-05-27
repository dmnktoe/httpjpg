"use client";

import { type ExtractedColor, extractVibrantColor } from "@httpjpg/spotify";
import { zIndex } from "@httpjpg/tokens";
import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";

import { MarqueeText } from "./marquee-text";
import { type NowPlayingSize, sizeConfig } from "./size-config";

export interface NowPlayingProps {
  title?: string;
  artist?: string;
  artwork?: string;
  isPlaying?: boolean;
  isLoading?: boolean;
  autoExtractColor?: boolean;
  vibrantColor?: string;
  textColor?: "black" | "white";
  size?: NowPlayingSize;
}

export function NowPlaying({
  title,
  artist,
  artwork,
  isPlaying = false,
  isLoading = false,
  autoExtractColor = true,
  vibrantColor,
  textColor,
  size = "sm",
}: NowPlayingProps) {
  const config = sizeConfig[size];
  const nodeRef = useRef<HTMLDivElement>(null);

  const [extractedColor, setExtractedColor] = useState<ExtractedColor | null>(null);
  const [currentArtwork, setCurrentArtwork] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);

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

  const finalVibrantColor = vibrantColor || extractedColor?.rgba;
  const finalTextColor = textColor || extractedColor?.textColor || "white";
  const hasVibrantColor = !!finalVibrantColor && !isExtracting;
  const glowColor = hasVibrantColor ? finalVibrantColor : "rgba(163, 163, 163, 0.6)";

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
            zIndex: zIndex.widget,
            touchAction: "none",
            userSelect: "none",
          }}
        >
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
              transition: "background 0.6s ease-in-out, box-shadow 0.6s ease-in-out",
            }}
          />

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
                animation: isLoading ? "skeleton-shimmer 2s ease-in-out infinite" : undefined,
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
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
                  <div style={{ fontSize: config.fontSize.title, fontWeight: 600 }}>
                    <MarqueeText>{title || ""}</MarqueeText>
                  </div>
                  <div style={{ fontSize: config.fontSize.artist, opacity: 0.9 }}>
                    <MarqueeText speed={25}>{artist || ""}</MarqueeText>
                  </div>
                </>
              )}
            </div>

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
}
