"use client";

import type { ConsentState } from "@httpjpg/consent";
import { CookieBanner, getConsent } from "@httpjpg/consent";
import { useEffect, useRef } from "react";

// Track if observability has been initialized
let observabilityInitialized = false;

export function ConsentProvider() {
  const initializedRef = useRef(false);

  const initializeObservability = async () => {
    if (observabilityInitialized) {
      return;
    }

    observabilityInitialized = true;

    const { initSentryClient } = await import(
      "@httpjpg/observability/sentry/client.ts"
    );
    const { initDatadogRum, initDatadogLogs } = await import(
      "@httpjpg/observability/datadog"
    );

    initSentryClient();
    initDatadogRum();
    initDatadogLogs();
  };

  const handleAcceptAll = async (consent: ConsentState) => {
    // Initialize analytics if consent given
    if (consent.analytics) {
      // You can add GA initialization here
    }

    // Initialize monitoring (Sentry/Datadog)
    if (consent.monitoring) {
      await initializeObservability();
    }
  };

  const handleRejectAll = () => {
    // Only required tracking enabled
  };

  const handleSavePreferences = async (consent: ConsentState) => {
    // Initialize only accepted services
    if (consent.analytics) {
      // You can add GA initialization here
    }

    if (consent.monitoring) {
      await initializeObservability();
    }
  };

  // Initialize services on mount if user already gave consent
  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    const existingConsent = getConsent();
    if (existingConsent?.monitoring) {
      initializeObservability();
    }
  }, []);

  const handleOpenCookieSettings = () => {
    window.dispatchEvent(new CustomEvent("openCookieSettings"));
  };

  // Expose handler globally for Footer
  useEffect(() => {
    (window as any).__openCookieSettings = handleOpenCookieSettings;
    return () => {
      delete (window as any).__openCookieSettings;
    };
  }, []);

  return (
    <CookieBanner
      onAcceptAll={handleAcceptAll}
      onRejectAll={handleRejectAll}
      onSavePreferences={handleSavePreferences}
    />
  );
}
