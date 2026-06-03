"use client";

import { useSyncExternalStore } from "react";

import { getConsent, hasVendorConsent, readConsentCookie } from "./consent";
import { CONSENT_CHANGE_EVENT } from "./events";
import type { ConsentCategory, ConsentState, ExternalVendor } from "./types";

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
  // Re-read on focus so consent changed in another tab is reflected here.
  window.addEventListener("focus", onStoreChange);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("focus", onStoreChange);
  };
}

let snapshotRaw: string | null = null;
let snapshotValue: ConsentState | null = null;

// useSyncExternalStore compares with Object.is, so return a stable reference
// while the cookie is unchanged — re-parsing each call would loop forever.
function getConsentSnapshot(): ConsentState | null {
  const raw = readConsentCookie();
  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    snapshotValue = getConsent();
  }
  return snapshotValue;
}

export function useConsent(): ConsentState | null {
  return useSyncExternalStore(subscribe, getConsentSnapshot, getServerConsent);
}

export function useConsentCategory(category: ConsentCategory): boolean {
  return useSyncExternalStore(subscribe, () => getConsent()?.[category] === true, getServerFalse);
}

export function useVendorConsent(vendor: ExternalVendor): boolean {
  return useSyncExternalStore(subscribe, () => hasVendorConsent(vendor), getServerFalse);
}

function getServerConsent(): ConsentState | null {
  return null;
}

function getServerFalse(): boolean {
  return false;
}
