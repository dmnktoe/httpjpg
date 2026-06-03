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
  }, []);

  return (
    <CookieBanner
      onAcceptAll={handleConsent}
      onRejectAll={() => {}}
      onSavePreferences={handleConsent}
    />
  );
}
