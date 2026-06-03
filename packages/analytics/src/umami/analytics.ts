import { env } from "@httpjpg/env";

import "./types";

export interface UmamiEventData {
  [key: string]: string | number | boolean | null | undefined;
}

function isUmamiAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.umami !== "undefined" &&
    !!env.NEXT_PUBLIC_UMAMI_ID
  );
}

export function trackUmamiEvent(eventName: string, data?: UmamiEventData): void {
  if (!isUmamiAvailable()) {
    return;
  }

  try {
    window.umami!.track(eventName, data ?? {});
  } catch {}
}
