/**
 * React Hook for Spotify Now Playing
 * Auto-refreshes every 10 seconds
 */

"use client";

import { useEffect, useState } from "react";

export interface NowPlayingData {
  title: string;
  artist: string;
  artwork: string;
  isPlaying: boolean;
  albumUrl?: string;
  trackUrl?: string;
}

export interface UseNowPlayingOptions {
  /**
   * API endpoint to fetch now playing data
   * Should return NowPlayingData or null
   */
  endpoint: string;
  /**
   * Polling interval in milliseconds
   * @default 10000 (10 seconds)
   */
  pollInterval?: number;
  /**
   * Enable polling
   * @default true
   */
  enabled?: boolean;
}

export interface UseNowPlayingReturn {
  data: NowPlayingData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and poll Spotify now playing data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useNowPlaying({
 *   endpoint: '/api/spotify/now-playing',
 *   pollInterval: 10000,
 * });
 *
 * if (data) {
 *   return <NowPlaying {...data} />;
 * }
 * ```
 */
export function useNowPlaying({
  endpoint,
  pollInterval = 10000,
  enabled = true,
}: UseNowPlayingOptions): UseNowPlayingReturn {
  const [data, setData] = useState<NowPlayingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNowPlaying = async () => {
    try {
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.data || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Initial fetch
    fetchNowPlaying();

    // Set up polling
    const interval = setInterval(fetchNowPlaying, pollInterval);

    return () => clearInterval(interval);
  }, [endpoint, pollInterval, enabled]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchNowPlaying,
  };
}
