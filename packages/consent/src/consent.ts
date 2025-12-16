import type { ConsentState, ExternalVendor } from "./types";
import {
  CONSENT_COOKIE_EXPIRY,
  CONSENT_COOKIE_NAME,
  EXTERNAL_VENDORS,
} from "./types";

/**
 * Get consent from cookies
 */
export function getConsent(): ConsentState | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));

  if (!cookie) {
    return null;
  }

  try {
    const value = cookie.split("=")[1];
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return null;
  }
}

/**
 * Set consent in cookies
 */
export function setConsent(consent: ConsentState): void {
  if (typeof document === "undefined") {
    return;
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + CONSENT_COOKIE_EXPIRY);

  const cookieValue = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  // biome-ignore lint/suspicious/noDocumentCookie: Using standard browser cookie API
  document.cookie = cookieValue;

  // Dispatch custom event to notify components of consent change
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("consentChange", { detail: consent }));
  }
}

/**
 * Clear consent cookie
 */
export function clearConsent(): void {
  if (typeof document === "undefined") {
    return;
  }

  // biome-ignore lint/suspicious/noDocumentCookie: Using standard browser cookie API
  document.cookie = `${CONSENT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Check if user has given consent
 */
export function hasConsent(): boolean {
  return getConsent() !== null;
}

/**
 * Check if user has given consent for a specific vendor
 *
 * @param vendor - The external vendor to check consent for
 * @returns true if consent is given for the vendor's category
 *
 * @example
 * ```tsx
 * if (hasVendorConsent('youtube')) {
 *   // Load YouTube embed
 * }
 * ```
 */
export function hasVendorConsent(vendor: ExternalVendor): boolean {
  const consent = getConsent();
  if (!consent) {
    return false;
  }

  const vendorInfo = EXTERNAL_VENDORS[vendor];
  return consent[vendorInfo.category] === true;
}

/**
 * Check if media consent is given (YouTube, Vimeo, Spotify, SoundCloud)
 *
 * @returns true if media consent is given
 */
export function hasMediaConsent(): boolean {
  const consent = getConsent();
  return consent?.media === true;
}
