"use client";

import { useCallback, useSyncExternalStore } from "react";

function getServerSnapshot() {
  return null;
}

export function useMediaQuery(query: string): boolean | null {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const media = window.matchMedia?.(query);
      media?.addEventListener("change", onStoreChange);
      return () => media?.removeEventListener("change", onStoreChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia?.(query).matches ?? null, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
