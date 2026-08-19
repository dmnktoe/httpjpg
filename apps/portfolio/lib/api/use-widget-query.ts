"use client";

import { useEffect, useState } from "react";
import type { z } from "zod";

export interface UseWidgetQueryOptions<T> {
  endpoint: string;
  schema: z.ZodType<T>;
  label: string;
  intervalMs?: number;
}

export interface UseWidgetQueryResult<T> {
  data: T | null;
  loaded: boolean;
}

export function useWidgetQuery<T>({
  endpoint,
  schema,
  label,
  intervalMs,
}: UseWidgetQueryOptions<T>): UseWidgetQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) {
          if (!cancelled) {
            setData(null);
          }
          return;
        }
        const parsed = schema.safeParse(await response.json());
        if (cancelled) {
          return;
        }
        if (!parsed.success) {
          console.error(`${label} response failed validation`);
          setData(null);
          return;
        }
        setData(parsed.data);
      } catch (error) {
        if (cancelled || controller.signal.aborted) {
          return;
        }
        console.error(`Failed to fetch ${label}:`, error);
        setData(null);
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }

    void load();
    const interval = intervalMs ? setInterval(() => void load(), intervalMs) : undefined;

    return () => {
      cancelled = true;
      controller.abort();
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [endpoint, intervalMs, label, schema]);

  return { data, loaded };
}
