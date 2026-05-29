export { ConsentPlaceholder } from "./components/consent-placeholder";
export { CookieBanner } from "./components/cookie-banner";
export { VendorList } from "./components/vendor-list";
export { hasVendorConsent, mapC15tToConsentState } from "./consent";
export type {
  ConsentCategory,
  ConsentConfig,
  ConsentState,
  ExternalVendor,
  VendorInfo,
} from "./types";
export {
  CATEGORY_TO_C15T,
  CONSENT_COOKIE_EXPIRY,
  CONSENT_COOKIE_NAME,
  DEFAULT_CONSENT_STATE,
  EXTERNAL_VENDORS,
  VENDOR_TO_C15T,
} from "./types";

export { ConsentManagerProvider } from "@c15t/nextjs/headless";
export { useConsentManager, useHeadlessConsentUI } from "@c15t/nextjs/headless";
export type { Script } from "c15t";
