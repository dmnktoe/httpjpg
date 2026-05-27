import { env } from "@httpjpg/env";

import "./types";

const GA_CATEGORIES = {
  USER_INTERACTION: "user_interaction",
  PERFORMANCE: "performance",
} as const;

type GACategory = (typeof GA_CATEGORIES)[keyof typeof GA_CATEGORIES];

export interface GAEventParams {
  category?: GACategory;
  label?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
}

function isGAAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.gtag !== "undefined" &&
    !!env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  );
}

function trackEvent(eventName: string, params?: GAEventParams): void {
  if (!isGAAvailable()) {
    return;
  }

  try {
    window.gtag("event", eventName, {
      event_category: params?.category,
      event_label: params?.label,
      value: params?.value,
      ...params,
    });
  } catch {}
}

export function trackNowPlayingClick(): void {
  trackEvent("now_playing_click", {
    category: GA_CATEGORIES.USER_INTERACTION,
    label: "spotify_widget",
  });
}

export function trackWebVital(name: "CLS" | "FCP" | "LCP" | "TTFB" | "INP", value: number): void {
  trackEvent("performance", {
    category: GA_CATEGORIES.PERFORMANCE,
    label: name,
    value: Math.round(value),
  });
}
