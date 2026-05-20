export { ConsentPlaceholder } from "./components/consent-placeholder";
export { CookieBanner } from "./components/cookie-banner";
export { VendorList } from "./components/vendor-list";
export {
  clearConsent,
  getConsent,
  hasConsent,
  hasMediaConsent,
  hasVendorConsent,
  setConsent,
} from "./consent";
export type {
  ConsentCategory,
  ConsentConfig,
  ConsentState,
  ExternalVendor,
  VendorInfo,
} from "./types";
export {
  CONSENT_COOKIE_EXPIRY,
  CONSENT_COOKIE_NAME,
  DEFAULT_CONSENT_STATE,
  EXTERNAL_VENDORS,
} from "./types";
