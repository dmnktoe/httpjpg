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
  endpoint: string;
  /** @default 10000 */
  pollInterval?: number;
  /** @default true */
  enabled?: boolean;
}

export interface UseNowPlayingReturn {
  data: NowPlayingData | null;
  isLoading: boolean;
  error: Error | null;
  /** Machine-readable error reason from the endpoint body (e.g. "premium_missing"). */
  errorCode: string | null;
  refetch: () => Promise<void>;
}

export function useNowPlaying({
  endpoint,
  pollInterval = 10000,
  enabled = true,
}: UseNowPlayingOptions): UseNowPlayingReturn {
  const [data, setData] = useState<NowPlayingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const fetchNowPlaying = async () => {
    try {
      const response = await fetch(endpoint);
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorCode(result?.error ?? "fetch_error");
        setError(new Error(result?.message ?? `Failed to fetch: ${response.statusText}`));
        setData(null);
        return;
      }

      setData(result?.data ?? null);
      setError(null);
      setErrorCode(null);
    } catch (err) {
      setErrorCode("network_error");
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

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, pollInterval);
    return () => clearInterval(interval);
  }, [endpoint, pollInterval, enabled]);

  return {
    data,
    isLoading,
    error,
    errorCode,
    refetch: fetchNowPlaying,
  };
}
