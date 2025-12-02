import { env } from "@httpjpg/env";
import "./types";

/**
 * Google Analytics Event Categories
 */
export const GA_CATEGORIES = {
  USER_INTERACTION: "user_interaction",
  NAVIGATION: "navigation",
  MEDIA: "media",
  WORK: "work",
  CONTACT: "contact",
  ERROR: "error",
  PERFORMANCE: "performance",
} as const;

export type GACategory = (typeof GA_CATEGORIES)[keyof typeof GA_CATEGORIES];

/**
 * Google Analytics Event Parameters
 */
export interface GAEventParams {
  category?: GACategory;
  label?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Check if Google Analytics is available
 */
function isGAAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.gtag !== "undefined" &&
    !!env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  );
}

/**
 * Track a custom event in Google Analytics
 *
 * @example
 * ```ts
 * trackEvent('button_click', {
 *   category: GA_CATEGORIES.USER_INTERACTION,
 *   label: 'hero_cta',
 *   value: 1
 * });
 * ```
 */
export function trackEvent(eventName: string, params?: GAEventParams): void {
  if (!isGAAvailable()) {
    if (env.NODE_ENV === "development") {
      console.log("[GA] Event tracked (dev):", eventName, params);
    }
    return;
  }

  try {
    window.gtag("event", eventName, {
      event_category: params?.category,
      event_label: params?.label,
      value: params?.value,
      ...params,
    });
  } catch (error) {
    console.error("[GA] Failed to track event:", error);
  }
}

/**
 * Track page views (automatically handled by Next.js Google Analytics component)
 */
export function trackPageView(url: string): void {
  if (!isGAAvailable() || !env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    return;
  }

  try {
    window.gtag("config", env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    });
  } catch (error) {
    console.error("[GA] Failed to track page view:", error);
  }
}

/**
 * Predefined event tracking helpers
 */

/**
 * Track navigation events
 */
export function trackNavigation(destination: string, label?: string): void {
  trackEvent("navigation", {
    category: GA_CATEGORIES.NAVIGATION,
    label: label || destination,
    destination,
  });
}

/**
 * Track work item views
 */
export function trackWorkView(workId: string, workTitle: string): void {
  trackEvent("work_view", {
    category: GA_CATEGORIES.WORK,
    label: workTitle,
    work_id: workId,
  });
}

/**
 * Track work item interactions (e.g., clicking on images, videos)
 */
export function trackWorkInteraction(
  workId: string,
  interactionType: "image_click" | "video_play" | "link_click",
): void {
  trackEvent("work_interaction", {
    category: GA_CATEGORIES.WORK,
    label: interactionType,
    work_id: workId,
  });
}

/**
 * Track media interactions
 */
export function trackMediaPlay(
  mediaType: "video" | "audio",
  mediaUrl: string,
): void {
  trackEvent("media_play", {
    category: GA_CATEGORIES.MEDIA,
    label: mediaType,
    media_url: mediaUrl,
  });
}

/**
 * Track contact form interactions
 */
export function trackContactInteraction(
  action: "open" | "submit" | "close",
): void {
  trackEvent("contact_form", {
    category: GA_CATEGORIES.CONTACT,
    label: action,
  });
}

/**
 * Track errors
 */
export function trackError(
  errorType: string,
  errorMessage?: string,
  fatal = false,
): void {
  trackEvent("error", {
    category: GA_CATEGORIES.ERROR,
    label: errorType,
    error_message: errorMessage,
    fatal,
  });
}

/**
 * Track custom cursor interactions
 */
export function trackCursorInteraction(interactionType: string): void {
  trackEvent("cursor_interaction", {
    category: GA_CATEGORIES.USER_INTERACTION,
    label: interactionType,
  });
}

/**
 * Track Spotify "Now Playing" interactions
 */
export function trackNowPlayingClick(): void {
  trackEvent("now_playing_click", {
    category: GA_CATEGORIES.USER_INTERACTION,
    label: "spotify_widget",
  });
}

/**
 * Track header interactions
 */
export function trackHeaderInteraction(
  action: "menu_open" | "menu_close" | "logo_click",
): void {
  trackEvent("header_interaction", {
    category: GA_CATEGORIES.USER_INTERACTION,
    label: action,
  });
}

/**
 * Track footer interactions
 */
export function trackFooterClick(linkType: string, destination?: string): void {
  trackEvent("footer_click", {
    category: GA_CATEGORIES.NAVIGATION,
    label: linkType,
    destination,
  });
}

/**
 * Track performance metrics
 */
export function trackPerformance(metric: string, value: number): void {
  trackEvent("performance", {
    category: GA_CATEGORIES.PERFORMANCE,
    label: metric,
    value: Math.round(value),
  });
}

/**
 * Track Web Vitals
 */
export function trackWebVital(
  name: "CLS" | "FID" | "FCP" | "LCP" | "TTFB",
  value: number,
): void {
  trackPerformance(name, value);
}
