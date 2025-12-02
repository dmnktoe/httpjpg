// Cookie consent types
export type ConsentCategory = "analytics" | "monitoring" | "preferences";

export interface ConsentState {
  analytics: boolean;
  monitoring: boolean;
  preferences: boolean;
}

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
}

export const DEFAULT_CONSENT_STATE: ConsentState = {
  analytics: false,
  monitoring: true, // Technical necessity
  preferences: true, // Technical necessity
};

export const CONSENT_COOKIE_NAME = "httpjpg_consent";
export const CONSENT_COOKIE_EXPIRY = 365; // days
