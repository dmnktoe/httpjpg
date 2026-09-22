import { GA_CATEGORIES, trackGoogleEvent } from "./google/analytics";
import { type UmamiEventData, trackUmamiEvent } from "./umami/analytics";

/** Shared event payload — Umami keeps types; GA flattens the same keys. */
export type EventData = UmamiEventData;

type WebVitalName = "CLS" | "FCP" | "LCP" | "TTFB" | "INP";
type WebVitalRating = "good" | "needs-improvement" | "poor";

export type SearchOpenSource = "keyboard" | "trigger";
export type WorkNavDirection = "prev" | "next";
export type AudioSkipDirection = "next" | "previous";
export type OutboundDestination =
  | "letterboxd"
  | "discogs"
  | "x"
  | "psn"
  | "cloudflare"
  | "external";

/**
 * Fan-out helper for ad-hoc events. Prefer the typed `track*` helpers below so
 * names and properties stay consistent across GA and Umami.
 */
export function trackEvent(name: string, data?: EventData): void {
  const payload = sanitizeEventData(data);

  trackGoogleEvent(name, {
    category: GA_CATEGORIES.USER_INTERACTION,
    ...toGoogleParams(payload),
  });
  trackUmamiEvent(name, payload);
}

export function trackNowPlayingClick(data?: { title?: string; artist?: string }): void {
  const payload = sanitizeEventData({
    widget: "spotify",
    title: data?.title,
    artist: data?.artist,
  });

  trackGoogleEvent("now_playing_click", {
    category: GA_CATEGORIES.USER_INTERACTION,
    label: "spotify_widget",
    ...toGoogleParams(payload),
  });
  trackUmamiEvent("now_playing_click", payload);
}

export function trackWebVital(name: WebVitalName, value: number): void {
  const rounded = name === "CLS" ? roundCls(value) : Math.round(value);
  const rating = rateWebVital(name, value);
  const payload = { metric: name, value: rounded, rating };

  trackGoogleEvent("performance", {
    category: GA_CATEGORIES.PERFORMANCE,
    label: name,
    value: rounded,
    rating,
  });
  trackUmamiEvent("web_vital", payload);
}

export function trackSearchOpen(source: SearchOpenSource): void {
  trackEvent("search_open", { source });
}

export function trackSearchSelect(data: { kind: string; href: string; queryLength: number }): void {
  trackEvent("search_select", {
    kind: data.kind,
    href: clipString(data.href),
    query_length: data.queryLength,
  });
}

export function trackAskSubmit(data: { queryLength: number }): void {
  trackEvent("ask_submit", { query_length: data.queryLength });
}

export function trackAskComplete(data: { hasAction: boolean; sourceCount: number }): void {
  trackEvent("ask_complete", {
    has_action: data.hasAction,
    source_count: data.sourceCount,
  });
}

export function trackAskError(data: { reason: string }): void {
  trackEvent("ask_error", { reason: clipString(data.reason, 80) });
}

export function trackAskAction(data: { href: string }): void {
  trackEvent("ask_action", { href: clipString(data.href) });
}

export function trackLightboxOpen(data: {
  type: "image" | "video";
  index: number;
  count: number;
}): void {
  trackEvent("lightbox_open", {
    type: data.type,
    index: data.index,
    count: data.count,
  });
}

export function trackLightboxNavigate(data: {
  type: "image" | "video";
  index: number;
  count: number;
}): void {
  trackEvent("lightbox_navigate", {
    type: data.type,
    index: data.index,
    count: data.count,
  });
}

export function trackLightboxClose(data?: { type?: "image" | "video"; index?: number }): void {
  trackEvent("lightbox_close", {
    type: data?.type,
    index: data?.index,
  });
}

export function trackAudioPlay(data?: { title?: string; href?: string }): void {
  trackEvent("audio_play", {
    title: data?.title,
    href: data?.href ? clipString(data.href) : undefined,
  });
}

export function trackAudioPause(data?: { title?: string; href?: string }): void {
  trackEvent("audio_pause", {
    title: data?.title,
    href: data?.href ? clipString(data.href) : undefined,
  });
}

export function trackAudioSkip(data: {
  direction: AudioSkipDirection;
  title?: string;
  href?: string;
}): void {
  trackEvent("audio_skip", {
    direction: data.direction,
    title: data.title,
    href: data.href ? clipString(data.href) : undefined,
  });
}

export function trackWorkNavClick(data: { direction: WorkNavDirection; slug: string }): void {
  trackEvent("work_nav_click", {
    direction: data.direction,
    slug: clipString(data.slug, 120),
  });
}

export function trackRelatedWorkClick(data: { href: string; view: string }): void {
  trackEvent("related_work_click", {
    href: clipString(data.href),
    view: data.view,
  });
}

export function trackRelatedWorkView(view: string): void {
  trackEvent("related_work_view", { view });
}

export function trackLocaleSwitch(data: { from: string; to: string }): void {
  trackEvent("locale_switch", { from: data.from, to: data.to });
}

export function trackOutboundClick(data: {
  destination: OutboundDestination;
  href?: string;
}): void {
  trackEvent("outbound_click", {
    destination: data.destination,
    href: data.href ? clipString(data.href) : undefined,
  });
}

export function trackComparisonInteract(data?: { orientation?: string }): void {
  trackEvent("comparison_interact", { orientation: data?.orientation });
}

/** Umami string limit is 500; keep a small headroom for encoding. */
const MAX_STRING = 480;

function sanitizeEventData(data?: EventData): EventData | undefined {
  if (!data) {
    return undefined;
  }

  const next: EventData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue;
    }
    if (typeof value === "string") {
      next[key] = clipString(value);
      continue;
    }
    if (typeof value === "number" && !Number.isFinite(value)) {
      continue;
    }
    next[key] = value;
  }
  return next;
}

function clipString(value: string, max = MAX_STRING): string {
  return value.length > max ? value.slice(0, max) : value;
}

function toGoogleParams(data?: EventData): Record<string, string | number | boolean> {
  if (!data) {
    return {};
  }
  const params: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      continue;
    }
    params[key] = value;
  }
  return params;
}

function roundCls(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function rateWebVital(name: WebVitalName, value: number): WebVitalRating {
  const [good, poor] = WEB_VITAL_THRESHOLDS[name];
  if (value <= good) {
    return "good";
  }
  if (value <= poor) {
    return "needs-improvement";
  }
  return "poor";
}

/** Core Web Vitals thresholds (good / poor). */
const WEB_VITAL_THRESHOLDS: Record<WebVitalName, readonly [number, number]> = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};
