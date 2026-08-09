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

const NOW_PLAYING_ERROR_CODES = [
  "premium_missing",
  "internal_error",
  "network_error",
  "fetch_error",
] as const;

export type NowPlayingErrorCode = (typeof NOW_PLAYING_ERROR_CODES)[number];

const TERMINAL_ERROR_CODES: readonly NowPlayingErrorCode[] = ["premium_missing"];

const MAX_CONSECUTIVE_ERRORS = 5;

export interface UseNowPlayingReturn {
  data: NowPlayingData | null;
  isLoading: boolean;
  error: Error | null;
  errorCode: NowPlayingErrorCode | null;
}

export function useNowPlaying({
  endpoint,
  pollInterval = 10000,
  enabled = true,
}: UseNowPlayingOptions): UseNowPlayingReturn {
  const [data, setData] = useState<NowPlayingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [errorCode, setErrorCode] = useState<NowPlayingErrorCode | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let ignore = false;
    let stopped = false;
    let isFetching = false;
    let consecutiveErrors = 0;
    let interval: ReturnType<typeof setInterval> | undefined;

    function stopPolling() {
      stopped = true;
      if (interval !== undefined) {
        clearInterval(interval);
        interval = undefined;
      }
    }

    function applyError(code: NowPlayingErrorCode, reason: Error) {
      setErrorCode(code);
      setError(reason);
      setData(null);

      consecutiveErrors += 1;
      if (TERMINAL_ERROR_CODES.includes(code) || consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        stopPolling();
      }
    }

    async function fetchNowPlaying() {
      if (stopped || isFetching) {
        return;
      }

      isFetching = true;
      try {
        const response = await fetch(endpoint);
        const result = await response.json().catch(() => null);
        if (ignore || stopped) {
          return;
        }

        if (!response.ok) {
          applyError(
            toErrorCode(result?.error),
            new Error(result?.message ?? `Failed to fetch: ${response.statusText}`),
          );
          return;
        }

        if (result?.unavailable) {
          applyError(
            toErrorCode(result.unavailable),
            new Error(result?.message ?? "Now playing is unavailable"),
          );
          return;
        }

        consecutiveErrors = 0;
        setData(result?.data ?? null);
        setError(null);
        setErrorCode(null);
      } catch (err) {
        if (ignore || stopped) {
          return;
        }
        applyError("network_error", err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        isFetching = false;
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchNowPlaying();
    if (!stopped) {
      interval = setInterval(fetchNowPlaying, pollInterval);
    }
    return () => {
      ignore = true;
      stopPolling();
    };
  }, [endpoint, pollInterval, enabled]);

  return {
    data,
    isLoading,
    error,
    errorCode,
  };
}

function toErrorCode(value: unknown): NowPlayingErrorCode {
  return NOW_PLAYING_ERROR_CODES.includes(value as NowPlayingErrorCode)
    ? (value as NowPlayingErrorCode)
    : "fetch_error";
}
