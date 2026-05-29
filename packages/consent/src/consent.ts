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

export function hasVendorConsent(vendor: ExternalVendor): boolean {
  const c = readC15tConsents();
  if (!c) {
    return false;
  }
  return c[VENDOR_TO_C15T[vendor]] === true;
}

export function mapC15tToConsentState(c15tConsents: Record<string, boolean>): ConsentState {
  return {
    analytics: c15tConsents.measurement ?? false,
    monitoring: c15tConsents.marketing ?? DEFAULT_CONSENT_STATE.monitoring,
    preferences: c15tConsents.functionality ?? DEFAULT_CONSENT_STATE.preferences,
    media: c15tConsents.experience ?? false,
  };
}
