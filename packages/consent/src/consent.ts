"use client";

import type { AllConsentNames } from "c15t";
import { getConsentFromStorage } from "c15t";

import type { ConsentState, ExternalVendor } from "./types";
import { CONSENT_COOKIE_NAME, DEFAULT_CONSENT_STATE, VENDOR_TO_C15T } from "./types";

interface C15tStoredConsent {
  consents: Record<AllConsentNames, boolean>;
}

function readC15tConsents(): Record<AllConsentNames, boolean> | null {
  const stored = getConsentFromStorage<C15tStoredConsent>({ storageKey: CONSENT_COOKIE_NAME });
  return stored?.consents ?? null;
}

/**
 * Reads the current consent state from c15t storage and maps it back
 * to our app-level ConsentState shape.
 */
export function getConsent(): ConsentState | null {
  if (typeof document === "undefined") {
    return null;
  }

  const c = readC15tConsents();
  if (!c) {
    return null;
  }

  return {
    analytics: c.measurement ?? false,
    monitoring: c.necessary ?? true,
    preferences: c.functionality ?? true,
    media: c.experience ?? false,
  };
}

export function hasConsent(): boolean {
  return getConsent() !== null;
}

export function hasVendorConsent(vendor: ExternalVendor): boolean {
  const c = readC15tConsents();
  if (!c) {
    return false;
  }
  const c15tName = VENDOR_TO_C15T[vendor];
  return c[c15tName] === true;
}

export function hasMediaConsent(): boolean {
  const c = readC15tConsents();
  return c?.experience === true;
}

/**
 * @deprecated Use the c15t ConsentManagerProvider and useConsentManager() hook instead.
 * Kept for backward compatibility with non-React consumers.
 */
export function setConsent(consent: ConsentState): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("consentChange", { detail: consent }));
  }
}

/**
 * @deprecated Consent is now managed by c15t. Clear via resetConsents() from the hook.
 */
export function clearConsent(): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${CONSENT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/** Convenience: map c15t consent state to our legacy shape. */
export function mapC15tToConsentState(c15tConsents: Record<string, boolean>): ConsentState {
  return {
    analytics: c15tConsents.measurement ?? false,
    monitoring: c15tConsents.necessary ?? DEFAULT_CONSENT_STATE.monitoring,
    preferences: c15tConsents.functionality ?? DEFAULT_CONSENT_STATE.preferences,
    media: c15tConsents.experience ?? false,
  };
}
