"use client";

import { useSyncExternalStore } from "react";

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

export function useFeedEditor(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
