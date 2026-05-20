"use client";

import type { ConsentState } from "@httpjpg/consent";
import { CookieBanner, getConsent } from "@httpjpg/consent";
import { useEffect, useRef } from "react";

let observabilityInitialized = false;

async function initObservability() {
  if (observabilityInitialized) {
    return;
  }
  observabilityInitialized = true;
  const { initSentryClient } = await import("@httpjpg/observability/sentry/client.ts");
  initSentryClient();
}

export function ConsentProvider() {
  const initializedRef = useRef(false);

  const handleConsent = async (consent: ConsentState) => {
    if (consent.monitoring) {
      await initObservability();
    }
  };

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    if (getConsent()?.monitoring) {
      initObservability();
    }

    const openSettings = () => {
      window.dispatchEvent(new CustomEvent("openCookieSettings"));
    };
    (window as any).__openCookieSettings = openSettings;
    return () => {
      delete (window as any).__openCookieSettings;
    };
  }, []);

  return (
    <CookieBanner
      onAcceptAll={handleConsent}
      onRejectAll={() => {}}
      onSavePreferences={handleConsent}
    />
  );
}
