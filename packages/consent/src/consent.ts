import type { ConsentState } from "./types";
import { CONSENT_COOKIE_EXPIRY, CONSENT_COOKIE_NAME } from "./types";

/**
 * Get consent from cookies
 */
// biome-ignore lint/style/useBlockStatements: Early returns improve readability
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
// biome-ignore lint/style/useBlockStatements: Early returns improve readability
export function setConsent(consent: ConsentState): void {
  if (typeof document === "undefined") {
    return;
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + CONSENT_COOKIE_EXPIRY);

  const cookieValue = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  // Using document.cookie is the standard way to set cookies in browsers
  document.cookie = cookieValue; // biome-ignore lint/suspicious/noDocumentCookie: Standard cookie API
}

/**
 * Clear consent cookie
 */
// biome-ignore lint/style/useBlockStatements: Early returns improve readability
export function clearConsent(): void {
  if (typeof document === "undefined") {
    return;
  }

  // Using document.cookie is the standard way to delete cookies in browsers
  document.cookie = `${CONSENT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`; // biome-ignore lint/suspicious/noDocumentCookie: Standard cookie API
}

/**
 * Check if user has given consent
 */
export function hasConsent(): boolean {
  return getConsent() !== null;
}
