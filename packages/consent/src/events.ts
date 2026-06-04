import type { ConsentState } from "./types";

/** Fired on the `window` whenever consent is saved or cleared. */
export const CONSENT_CHANGE_EVENT = "consentChange";

// The "open cookie settings" event is owned by @httpjpg/ui's Footer (the
// dispatcher); consent only listens. It's re-exported from the package index.

declare global {
  interface WindowEventMap {
    consentChange: CustomEvent<ConsentState | null>;
    openCookieSettings: CustomEvent<void>;
  }
}
