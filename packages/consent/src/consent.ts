import { CONSENT_CHANGE_EVENT } from "./events";
import type { ConsentState, ExternalVendor } from "./types";
import {
  CONSENT_CATEGORIES,
  CONSENT_COOKIE_EXPIRY,
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
  DEFAULT_CONSENT_STATE,
  EXTERNAL_VENDORS,
  REQUIRED_CATEGORIES,
} from "./types";

interface StoredConsent {
  v: number;
  consent: ConsentState;
}

export function getConsent(): ConsentState | null {
  const raw = readConsentCookie();
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (parsed.v !== CONSENT_VERSION) {
      return null;
    }
    return normalizeConsent(parsed.consent);
  } catch {
    return null;
  }
}

export function setConsent(consent: ConsentState): void {
  if (typeof document === "undefined") {
    return;
  }
  const normalized = normalizeConsent(consent) ?? { ...DEFAULT_CONSENT_STATE };
  const expires = new Date();
  expires.setDate(expires.getDate() + CONSENT_COOKIE_EXPIRY);
  const stored: StoredConsent = { v: CONSENT_VERSION, consent: normalized };
  const value = encodeURIComponent(JSON.stringify(stored));
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secure}`;
  dispatchConsentChange(normalized);
}

export function clearConsent(): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${CONSENT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  dispatchConsentChange(null);
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

/** Decoded consent cookie value, or null. */
export function readConsentCookie(): string | null {
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
    return decodeURIComponent(cookie.slice(CONSENT_COOKIE_NAME.length + 1));
  } catch {
    // Malformed percent-encoding (e.g. a value set by another script) — treat
    // as no consent rather than throwing through every getConsent caller.
    return null;
  }
}

/** Coerce an untrusted parsed value into a valid `ConsentState`, or null. */
function normalizeConsent(value: unknown): ConsentState | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const result: ConsentState = { ...DEFAULT_CONSENT_STATE };
  for (const category of CONSENT_CATEGORIES) {
    if (typeof record[category] === "boolean") {
      result[category] = record[category] as boolean;
    }
  }
  for (const category of REQUIRED_CATEGORIES) {
    result[category] = true;
  }
  return result;
}

function dispatchConsentChange(consent: ConsentState | null): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: consent }));
}
