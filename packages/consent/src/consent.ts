import type { ConsentState, ExternalVendor } from "./types";
import { CONSENT_COOKIE_EXPIRY, CONSENT_COOKIE_NAME, EXTERNAL_VENDORS } from "./types";

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
    return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
  } catch {
    return null;
  }
}

export function setConsent(consent: ConsentState): void {
  if (typeof document === "undefined") {
    return;
  }
  const expires = new Date();
  expires.setDate(expires.getDate() + CONSENT_COOKIE_EXPIRY);
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("consentChange", { detail: consent }));
  }
}

export function clearConsent(): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${CONSENT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function hasConsent(): boolean {
  return getConsent() !== null;
}

export function hasVendorConsent(vendor: ExternalVendor): boolean {
  const consent = getConsent();
  if (!consent) {
    return false;
  }
  return consent[EXTERNAL_VENDORS[vendor].category] === true;
}

export function hasMediaConsent(): boolean {
  return getConsent()?.media === true;
}
