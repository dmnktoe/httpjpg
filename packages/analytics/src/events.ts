import { GA_CATEGORIES, trackGoogleEvent } from "./google/analytics";
import { trackUmamiEvent } from "./umami/analytics";

type WebVitalName = "CLS" | "FCP" | "LCP" | "TTFB" | "INP";

/**
 * Domain events are provider-agnostic: each fans out to every configured
 * analytics provider. Providers no-op individually when unconfigured, so call
 * sites never branch on which backend is active.
 */
export function trackNowPlayingClick(): void {
  trackGoogleEvent("now_playing_click", {
    category: GA_CATEGORIES.USER_INTERACTION,
    label: "spotify_widget",
  });
  trackUmamiEvent("now_playing_click", { widget: "spotify" });
}

export function trackWebVital(name: WebVitalName, value: number): void {
  const rounded = Math.round(value);

  trackGoogleEvent("performance", {
    category: GA_CATEGORIES.PERFORMANCE,
    label: name,
    value: rounded,
  });
  trackUmamiEvent("web-vital", { metric: name, value: rounded });
}
