// Cookie consent types
export type ConsentCategory =
  | "analytics"
  | "monitoring"
  | "preferences"
  | "media";

export interface ConsentState {
  analytics: boolean;
  monitoring: boolean;
  preferences: boolean;
  media: boolean;
}

/**
 * External vendors that require consent
 */
export type ExternalVendor =
  // Analytics
  | "google-analytics"
  // Monitoring & Error Tracking
  | "sentry"
  | "datadog"
  // Media & Content
  | "youtube"
  | "vimeo"
  | "spotify"
  | "soundcloud"
  | "generic-media";

/**
 * Vendor information for display in consent UI
 */
export interface VendorInfo {
  name: string;
  description: string;
  category: ConsentCategory;
  privacyPolicy?: string;
}

/**
 * Vendor registry with metadata
 * Organized by category: Analytics → Monitoring → Media
 */
export const EXTERNAL_VENDORS: Record<ExternalVendor, VendorInfo> = {
  // Analytics Services
  "google-analytics": {
    name: "Google Analytics",
    description:
      "Tracks website usage, visitor behavior, and performance metrics",
    category: "analytics",
    privacyPolicy: "https://policies.google.com/privacy",
  },

  // Monitoring & Error Tracking
  sentry: {
    name: "Sentry",
    description:
      "Error tracking and performance monitoring for stability improvements",
    category: "monitoring",
    privacyPolicy: "https://sentry.io/privacy/",
  },
  datadog: {
    name: "Datadog",
    description:
      "Real-time performance monitoring and infrastructure observability",
    category: "monitoring",
    privacyPolicy: "https://www.datadoghq.com/legal/privacy/",
  },

  // Media & Content Services
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

export const DEFAULT_CONSENT_STATE: ConsentState = {
  analytics: false,
  monitoring: true, // Technical necessity
  preferences: true, // Technical necessity
  media: false, // External media requires explicit consent
};

export const CONSENT_COOKIE_NAME = "httpjpg_consent";
export const CONSENT_COOKIE_EXPIRY = 365; // days
