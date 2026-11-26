"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 60_000;

const listeners = new Set<() => void>();
let now = 0;
let timer: ReturnType<typeof setInterval> | undefined;

function tick() {
  now = Date.now();
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (listeners.size === 1) {
    timer = setInterval(tick, TICK_MS);
    tick();
  }
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
      now = 0;
    }
  };
}

function getClientNow() {
  return now;
}

function getServerNow() {
  return 0;
}

export function useClientNow(): number {
  return useSyncExternalStore(subscribe, getClientNow, getServerNow);
}
