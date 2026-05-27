import type { AllConsentNames } from "c15t";

export type ConsentCategory = "analytics" | "monitoring" | "preferences" | "media";

export interface ConsentState {
  analytics: boolean;
  monitoring: boolean;
  preferences: boolean;
  media: boolean;
}

export type ExternalVendor =
  | "google-analytics"
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
}

export const EXTERNAL_VENDORS: Record<ExternalVendor, VendorInfo> = {
  "google-analytics": {
    name: "Google Analytics",
    description: "Tracks website usage, visitor behavior, and performance metrics",
    category: "analytics",
    privacyPolicy: "https://policies.google.com/privacy",
  },

  umami: {
    name: "Umami",
    description: "Privacy-focused website analytics for page views and usage patterns",
    category: "analytics",
    privacyPolicy: "https://umami.is/privacy",
  },

  sentry: {
    name: "Sentry",
    description: "Error tracking and performance monitoring for stability improvements",
    category: "monitoring",
    privacyPolicy: "https://sentry.io/privacy/",
  },

  youtube: {
    name: "YouTube",
    description: "Video embeds hosted by Google - loads when playing videos",
    category: "media",
    privacyPolicy: "https://policies.google.com/privacy",
  },
  vimeo: {
    name: "Vimeo",
    description: "High-quality video embeds - loads when playing videos",
    category: "media",
    privacyPolicy: "https://vimeo.com/privacy",
  },
  spotify: {
    name: "Spotify",
    description: "Music and podcast player embeds - loads when playing audio",
    category: "media",
    privacyPolicy: "https://www.spotify.com/privacy",
  },
  soundcloud: {
    name: "SoundCloud",
    description: "Audio streaming embeds - loads when playing tracks",
    category: "media",
    privacyPolicy: "https://soundcloud.com/pages/privacy",
  },
  "generic-media": {
    name: "External Media",
    description: "Other external media content and embeds",
    category: "media",
  },
};

export interface ConsentConfig {
  analytics: {
    label: string;
    description: string;
    required: boolean;
  };
  monitoring: {
    label: string;
    description: string;
    required: boolean;
  };
  preferences: {
    label: string;
    description: string;
    required: boolean;
  };
  media: {
    label: string;
    description: string;
    required: boolean;
  };
}

/** Required categories default to `true` (technical necessity); opt-ins default to `false`. */
export const DEFAULT_CONSENT_STATE: ConsentState = {
  analytics: false,
  monitoring: true,
  preferences: true,
  media: false,
};

export const CONSENT_COOKIE_NAME = "c15t";
export const CONSENT_COOKIE_EXPIRY = 365;

/**
 * Maps our app-level consent categories to c15t's built-in consent names.
 * - analytics  → measurement
 * - monitoring → necessary (always on)
 * - preferences → functionality (always on)
 * - media      → experience
 */
export const CATEGORY_TO_C15T: Record<ConsentCategory, AllConsentNames> = {
  analytics: "measurement",
  monitoring: "necessary",
  preferences: "functionality",
  media: "experience",
};

export const VENDOR_TO_C15T: Record<ExternalVendor, AllConsentNames> = {
  "google-analytics": "measurement",
  umami: "measurement",
  sentry: "necessary",
  youtube: "experience",
  vimeo: "experience",
  spotify: "experience",
  soundcloud: "experience",
  "generic-media": "experience",
};
