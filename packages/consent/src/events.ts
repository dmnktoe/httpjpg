import type { ConsentState } from "./types";

/** Fired on the `window` whenever consent is saved or cleared. */
export const CONSENT_CHANGE_EVENT = "consentChange";

/** Fired on the `window` to ask the cookie banner to open its settings view. */
export const OPEN_COOKIE_SETTINGS_EVENT = "openCookieSettings";

declare global {
  interface WindowEventMap {
    consentChange: CustomEvent<ConsentState | null>;
    openCookieSettings: CustomEvent<void>;
  }
}
