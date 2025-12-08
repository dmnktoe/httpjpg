"use client";

import { trackNowPlayingClick } from "@httpjpg/analytics";
import { NowPlaying, useNowPlaying } from "@httpjpg/now-playing";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Spotify Now Playing Widget
 * Fetches and displays currently playing track from Spotify
 * Automatically polls every 10 seconds
 */
function NowPlayingWidgetComponent() {
  const [mounted, setMounted] = useState(false);
  const { data, isLoading } = useNowPlaying({
    endpoint: "/api/spotify/now-playing",
    pollInterval: 10000,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleClick = () => {
    trackNowPlayingClick();
  };

  const content = (
    <button type="button" onClick={handleClick} style={{ all: "unset" }}>
      <NowPlaying
        title={
          isLoading ? "Loading..." : data?.title || "╱╱ Nothing playing ╱╱"
        }
        artist={isLoading ? "..." : data?.artist || "⋄ ⋄ ⋄"}
        artwork={
          data?.artwork ||
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23a3a3a3' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='monospace' font-size='40' text-anchor='middle' dy='.3em' fill='white'%3E♪%3C/text%3E%3C/svg%3E"
        }
        isPlaying={data?.isPlaying || false}
        isLoading={isLoading}
        autoExtractColor={!!data && !isLoading}
        vibrantColor={
          !data || isLoading ? "rgba(163, 163, 163, 0.6)" : undefined
        }
        textColor={!data || isLoading ? "white" : undefined}
      />
    </button>
  );

  return createPortal(content, document.body);
}

/**
 * Client-side wrapper with dynamic import (SSR disabled)
 */
export const NowPlayingWidget = dynamic(
  () => Promise.resolve(NowPlayingWidgetComponent),
  { ssr: false },
);
