"use client";

import { useSyncExternalStore } from "react";

/** Set beside the composer's session: it only says that this browser signed in, and opens nothing. */
export const FEED_EDITOR_COOKIE = "httpjpg_feed_editor";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return document.cookie.split("; ").includes(`${FEED_EDITOR_COOKIE}=1`);
}

function getServerSnapshot() {
  return false;
}

/** Whether this browser is signed in to the feed's composer. False on the server and while hydrating. */
export function useFeedEditor(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
