export type ConsentCategory = "analytics" | "monitoring" | "preferences" | "media";

export interface ConsentState {
  analytics: boolean;
  monitoring: boolean;
  preferences: boolean;
  media: boolean;
}

/** Render order for all consent categories. */
export const CONSENT_CATEGORIES = [
  "preferences",
  "monitoring",
  "analytics",
  "media",
] as const satisfies readonly ConsentCategory[];

/** Categories that are technically necessary and can't be turned off. */
export const REQUIRED_CATEGORIES = new Set<ConsentCategory>(["preferences", "monitoring"]);

/**
 * Privacy-friendly, self-hosted analytics may run until the visitor opts out.
 * Absence of a stored decision still allows these categories.
 */
export const OPT_OUT_CATEGORIES = new Set<ConsentCategory>(["analytics"]);

export type ExternalVendor =
  | "umami"
  | "sentry"
  | "youtube"
  | "vimeo"
  | "spotify"
  | "soundcloud"
  | "generic-media";

export interface VendorInfo {
  name: string;
  description: string;
  category: ConsentCategory;
  privacyPolicy?: string;
  /** Canonical cookiedatabase.org service page when the vendor is catalogued. */
  cookieDatabase?: string;
}

export const COOKIE_DATABASE_ORIGIN = "https://cookiedatabase.org";

export function cookieDatabaseServiceUrl(slug: string): string {
  return `${COOKIE_DATABASE_ORIGIN}/service/${slug}/`;
}

export function cookieDatabaseCookieUrl(serviceSlug: string, cookieName: string): string {
  return `${COOKIE_DATABASE_ORIGIN}/cookie/${serviceSlug}/${cookieName.toLowerCase()}/`;
}

export const EXTERNAL_VENDORS: Record<ExternalVendor, VendorInfo> = {
  umami: {
    name: "Umami",
    description:
      "Privacy-first, cookieless analytics on our own EU (Hetzner Nürnberg) server — aggregate usage only; on by default, opt out anytime",
    category: "analytics",
    privacyPolicy: "https://umami.is/privacy",
    // Not yet catalogued; search keeps the cookiedatabase.org connection.
    cookieDatabase: `${COOKIE_DATABASE_ORIGIN}/?s=umami`,
  },

  sentry: {
    name: "Sentry",
    description: "Error tracking and performance monitoring for stability improvements",
    category: "monitoring",
    privacyPolicy: "https://sentry.io/privacy/",
    cookieDatabase: `${COOKIE_DATABASE_ORIGIN}/?s=sentry`,
  },

  youtube: {
    name: "YouTube",
    description: "Video embeds hosted by Google - loads when playing videos",
    category: "media",
    privacyPolicy: "https://policies.google.com/privacy",
    cookieDatabase: cookieDatabaseServiceUrl("youtube"),
  },
  vimeo: {
    name: "Vimeo",
    description: "High-quality video embeds - loads when playing videos",
    category: "media",
    privacyPolicy: "https://vimeo.com/privacy",
    cookieDatabase: cookieDatabaseServiceUrl("vimeo"),
  },
  spotify: {
    name: "Spotify",
    description: "Music and podcast player embeds - loads when playing audio",
    category: "media",
    privacyPolicy: "https://www.spotify.com/privacy",
    cookieDatabase: cookieDatabaseServiceUrl("spotify"),
  },
  soundcloud: {
    name: "SoundCloud",
    description: "Audio streaming embeds - loads when playing tracks",
    category: "media",
    privacyPolicy: "https://soundcloud.com/pages/privacy",
    cookieDatabase: cookieDatabaseServiceUrl("soundcloud"),
  },
  "generic-media": {
    name: "External Media",
    description: "Other external media content and embeds",
    category: "media",
  },
};

export interface SiteCookieInfo {
  name: string;
  provider: string;
  purpose: string;
  category: ConsentCategory;
  /** First-party cookies we set ourselves have no third-party database entry. */
  cookieDatabase?: string;
  duration: string;
}

/** Cookies / similar storage this site may set — linked to cookiedatabase.org where known. */
export const SITE_COOKIES: readonly SiteCookieInfo[] = [
  {
    name: "httpjpg_consent",
    provider: "httpjpg (first-party)",
    purpose: "Stores your cookie preference choices so we remember them across visits",
    category: "preferences",
    duration: "1 year",
  },
  {
    name: "VISITOR_INFO1_LIVE",
    provider: "YouTube",
    purpose: "Estimates bandwidth and may track the visitor on YouTube embeds",
    category: "media",
    cookieDatabase: cookieDatabaseCookieUrl("youtube", "visitor_info1_live"),
    duration: "6 months",
  },
  {
    name: "YSC",
    provider: "YouTube",
    purpose: "Session cookie set by YouTube embeds",
    category: "media",
    cookieDatabase: cookieDatabaseCookieUrl("youtube", "ysc"),
    duration: "session",
  },
  {
    name: "PREF",
    provider: "YouTube",
    purpose: "Stores YouTube player preferences",
    category: "media",
    cookieDatabase: cookieDatabaseCookieUrl("youtube", "pref"),
    duration: "8 months",
  },
  {
    name: "GPS",
    provider: "YouTube",
    purpose: "Stores location data for YouTube embeds on mobile",
    category: "media",
    cookieDatabase: cookieDatabaseCookieUrl("youtube", "gps"),
    duration: "session",
  },
  {
    name: "sp_t",
    provider: "Spotify",
    purpose: "Provides Spotify embed functionality across pages",
    category: "media",
    cookieDatabase: cookieDatabaseCookieUrl("spotify", "sp_t"),
    duration: "1 year",
  },
];

/**
 * Explicit Reject All / minimal choice: analytics off, media off.
 * Required categories stay on. Distinct from the implied pre-decision defaults
 * (see `impliedConsent` / `OPT_OUT_CATEGORIES`).
 */
export const DEFAULT_CONSENT_STATE: ConsentState = {
  analytics: false,
  monitoring: true,
  preferences: true,
  media: false,
};

/** Effective consent when the visitor has not stored a decision yet. */
export function impliedConsent(): ConsentState {
  return {
    ...DEFAULT_CONSENT_STATE,
    analytics: OPT_OUT_CATEGORIES.has("analytics"),
  };
}

/** Whether a category is allowed given stored consent (or implied defaults). */
export function isCategoryAllowed(
  consent: ConsentState | null,
  category: ConsentCategory,
): boolean {
  if (consent) {
    return consent[category] === true;
  }
  if (OPT_OUT_CATEGORIES.has(category)) {
    return true;
  }
  return DEFAULT_CONSENT_STATE[category];
}

export const CONSENT_COOKIE_NAME = "httpjpg_consent";
export const CONSENT_COOKIE_EXPIRY = 365;

/** Bump on schema changes; consent stored under a different version is discarded. */
export const CONSENT_VERSION = 2;
