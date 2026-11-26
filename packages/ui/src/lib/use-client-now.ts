"use client";

import { useSyncExternalStore } from "react";

let now = 0;
let subscribers = 0;

function subscribe(onStoreChange: () => void) {
  if (subscribers === 0) {
    now = Date.now();
    onStoreChange();
  }
  subscribers += 1;
  return () => {
    subscribers -= 1;
    if (subscribers === 0) {
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

/**
 * The time the page's first caller mounted; 0 on the server and while hydrating,
 * so anything derived from it renders the same on both sides first.
 */
export function useClientNow(): number {
  return useSyncExternalStore(subscribe, getClientNow, getServerNow);
}
