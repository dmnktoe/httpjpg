import { type UmamiEventData, trackUmamiEvent } from "./umami/analytics";

/** Shared event payload for Umami custom events. */
export type EventData = UmamiEventData;

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
 * Ad-hoc events. Prefer the typed `track*` helpers below so names and
 * properties stay consistent.
 */
export function trackEvent(name: string, data?: EventData): void {
  trackUmamiEvent(name, sanitizeEventData(data));
}

export function trackNowPlayingClick(data?: {
  title?: string;
  artist?: string;
  href?: string;
}): void {
  trackUmamiEvent(
    "now_playing_click",
    sanitizeEventData({
      widget: "spotify",
      title: data?.title,
      artist: data?.artist,
      href: data?.href ? clipString(data.href) : undefined,
    }),
  );
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

export function trackLightboxOpen(data: LightboxEventData): void {
  trackEvent("lightbox_open", lightboxPayload(data));
}

export function trackLightboxNavigate(data: LightboxEventData): void {
  trackEvent("lightbox_navigate", lightboxPayload(data));
}

export function trackLightboxClose(
  data?: Pick<LightboxEventData, "type" | "index" | "src" | "alt">,
): void {
  trackEvent("lightbox_close", {
    type: data?.type,
    index: data?.index,
    src: data?.src ? clipString(data.src) : undefined,
    alt: data?.alt,
  });
}

export function trackAudioPlay(data?: AudioEventData): void {
  trackEvent("audio_play", audioPayload(data));
}

export function trackAudioPause(data?: AudioEventData): void {
  trackEvent("audio_pause", audioPayload(data));
}

export function trackAudioSkip(data: AudioEventData & { direction: AudioSkipDirection }): void {
  trackEvent("audio_skip", {
    direction: data.direction,
    ...audioPayload(data),
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
  /** Human-readable target (film title, release, trophy, …) for Umami Properties. */
  label?: string;
}): void {
  trackEvent("outbound_click", {
    destination: data.destination,
    href: data.href ? clipString(data.href) : undefined,
    label: data.label ? clipString(data.label, MAX_LABEL) : undefined,
  });
}

export function trackComparisonInteract(data?: { orientation?: string }): void {
  trackEvent("comparison_interact", { orientation: data?.orientation });
}

interface LightboxEventData {
  type: "image" | "video";
  index: number;
  count: number;
  src?: string;
  alt?: string;
}

interface AudioEventData {
  title?: string;
  artist?: string;
  /** Audio file URL — the track identity. */
  src?: string;
  /** Page the track was registered from. */
  href?: string;
}

function lightboxPayload(data: LightboxEventData): EventData {
  return {
    type: data.type,
    index: data.index,
    count: data.count,
    src: data.src ? clipString(data.src) : undefined,
    alt: data.alt,
  };
}

function audioPayload(data?: AudioEventData): EventData {
  return {
    title: data?.title,
    artist: data?.artist,
    src: data?.src ? clipString(data.src) : undefined,
    href: data?.href ? clipString(data.href) : undefined,
  };
}

/** Umami string limit is 500; keep a small headroom for encoding. */
const MAX_STRING = 480;
/** Keep outbound labels short so the Properties breakdown stays readable. */
const MAX_LABEL = 160;

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
