"use client";

import {
  NowPlaying,
  NowPlayingLoading,
  useNowPlaying,
} from "@httpjpg/now-playing";
import { useEffect, useState } from "react";

/**
 * Spotify Now Playing Widget
 * Fetches and displays currently playing track from Spotify
 * Automatically polls every 10 seconds
 */
export function NowPlayingWidget() {
  const [isMounted, setIsMounted] = useState(false);
  const { data, isLoading, error } = useNowPlaying({
    endpoint: "/api/spotify/now-playing",
    pollInterval: 10000,
  });

  // Calculate position on client side only
  const [position, setPosition] = useState({ x: 20, y: 40 });

  useEffect(() => {
    setIsMounted(true);
    setPosition({
      x: window.innerWidth - 280,
      y: 40,
    });
  }, []);

  // Don't render during SSR
  if (!isMounted) {
    return null;
  }

  // Show loading state initially
  if (isLoading) {
    return <NowPlayingLoading initialPosition={position} />;
  }

  // Show nothing playing state when no data or error
  if (error || !data) {
    return (
      <NowPlaying
        title="╱╱ Nothing playing ╱╱"
        artist="⋄ ⋄ ⋄"
        artwork="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23a3a3a3' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='monospace' font-size='40' text-anchor='middle' dy='.3em' fill='white'%3E♪%3C/text%3E%3C/svg%3E"
        isPlaying={false}
        autoExtractColor={false}
        vibrantColor="rgba(163, 163, 163, 0.6)"
        initialPosition={position}
      />
    );
  }

  return <NowPlaying {...data} initialPosition={position} />;
}
