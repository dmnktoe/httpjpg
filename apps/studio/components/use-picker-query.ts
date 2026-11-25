"use client";

import { useEffect, useState } from "react";

interface PickerQueryOptions {
  open: boolean;
  endpoint: string;
  itemsKey: string;
  perPage: number;
  startsWith?: string;
}

interface PickerControls {
  search: string;
  onSearch(value: string): void;
  page: number;
  pages: number;
  onPage(page: number): void;
  loading: boolean;
  error: string | null;
}

interface PickerQuery<T> {
  items: T[];
  controls: PickerControls;
}

interface PickerResponse {
  ok?: boolean;
  total?: number;
  perPage?: number;
  error?: string;
  [key: string]: unknown;
}

export function usePickerQuery<T>({
  open,
  endpoint,
  itemsKey,
  perPage: requestedPerPage,
  startsWith,
}: PickerQueryOptions): PickerQuery<T> {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(requestedPerPage);
  const [loading, setLoading] = useState(open);
  const [error, setError] = useState<string | null>(null);
  const requestKey = `${open}:${page}:${search}:${startsWith ?? ""}`;
  const [prevRequestKey, setPrevRequestKey] = useState(requestKey);
  if (requestKey !== prevRequestKey) {
    setPrevRequestKey(requestKey);
    if (open) {
      setLoading(true);
      setError(null);
    }
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), per_page: String(requestedPerPage) });
    if (search) params.set("search", search);
    if (startsWith) params.set("starts_with", startsWith);
    fetch(`${endpoint}?${params}`)
      .then((r) => r.json())
      .then((data: PickerResponse) => {
        if (cancelled) return;
        if (!data.ok) {
          setError(data.error ?? "Unknown error");
        } else {
          setItems((data[itemsKey] as T[] | undefined) ?? []);
          setTotal(data.total ?? 0);
          setPerPage(data.perPage ?? requestedPerPage);
        }
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, page, search, startsWith, endpoint, itemsKey, requestedPerPage]);

  return {
    items,
    controls: {
      search,
      onSearch(value) {
        setPage(1);
        setSearch(value);
      },
      page,
      pages: Math.max(1, Math.ceil(total / perPage)),
      onPage: setPage,
      loading,
      error,
    },
  };
}

export type { PickerControls };
