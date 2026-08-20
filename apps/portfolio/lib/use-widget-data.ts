"use client";

import { useEffect, useRef, useState } from "react";

export interface UseWidgetDataOptions {
  /**
   * Re-fetch interval in milliseconds. Omitted, the widget fetches once on
   * mount. Polling pauses while the tab is hidden and catches up on return.
   */
  pollMs?: number;
  /** Skips the request entirely, for a widget the CMS has switched off. */
  enabled?: boolean;
}

export interface WidgetData<T> {
  data: T | null;
  /**
   * True once the first request has settled, successfully or not. Widgets hold
   * a placeholder until then and collapse afterwards, so an endpoint that is
   * off (501) leaves no gap in the footer.
   */
  loaded: boolean;
}

/**
 * Fetches one footer widget's JSON.
 *
 * Every status widget wants the same three things — one request on mount, the
 * response or nothing, and a flag saying whether the answer has arrived — plus
 * a couple that are easy to get subtly wrong: aborting in flight when the
 * widget unmounts, and not polling a tab nobody is looking at.
 */
export function useWidgetData<T>(
  url: string,
  { pollMs, enabled = true }: UseWidgetDataOptions = {},
): WidgetData<T> {
  const [data, setData] = useState<T | null>(null);
  const [loaded, setLoaded] = useState(false);
  // Kept in a ref so the polling effect does not re-subscribe when it changes.
  const pollRef = useRef(pollMs);
  pollRef.current = pollMs;

  useEffect(() => {
    if (!enabled) {
      setLoaded(true);
      return;
    }

    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      const interval = pollRef.current;
      if (interval === undefined || controller.signal.aborted) {
        return;
      }
      timer = setTimeout(run, interval);
    };

    async function run() {
      // A hidden tab cannot show the answer, so skip the round trip and try
      // again on the next tick; the visibility listener covers a fast return.
      if (document.visibilityState === "hidden") {
        schedule();
        return;
      }

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (response.ok) {
          setData((await response.json()) as T);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error(`Failed to fetch ${url}:`, error);
      }

      if (!controller.signal.aborted) {
        setLoaded(true);
        schedule();
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && pollRef.current !== undefined) {
        clearTimeout(timer);
        run();
      }
    };

    run();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      controller.abort();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [url, enabled]);

  return { data, loaded };
}
