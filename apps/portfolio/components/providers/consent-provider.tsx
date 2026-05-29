"use client";

import type { ConsentState, Script } from "@httpjpg/consent";
import {
  CONSENT_COOKIE_EXPIRY,
  CONSENT_COOKIE_NAME,
  ConsentManagerProvider,
  CookieBanner,
  mapC15tToConsentState,
  useConsentManager,
} from "@httpjpg/consent";
import { env } from "@httpjpg/env";
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

const scripts: Script[] = [];

if (env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && env.NEXT_PUBLIC_UMAMI_HOST) {
  scripts.push({
    id: "umami",
    src: `${env.NEXT_PUBLIC_UMAMI_HOST}/script.js`,
    category: "measurement",
    defer: true,
    attributes: {
      "data-website-id": env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    },
  });
}

function ConsentBannerInner() {
  const initializedRef = useRef(false);
  const { consents, hasConsented, subscribeToConsentChanges } = useConsentManager();

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

    if (hasConsented() && (consents as unknown as Record<string, boolean>).necessary) {
      initObservability();
    }

    const openSettings = () => {
      window.dispatchEvent(new CustomEvent("openCookieSettings"));
    };
    (window as any).__openCookieSettings = openSettings;
    return () => {
      delete (window as any).__openCookieSettings;
    };
  }, [consents, hasConsented]);

  useEffect(() => {
    return subscribeToConsentChanges((payload) => {
      const mapped = mapC15tToConsentState(
        payload.preferences as unknown as Record<string, boolean>,
      );
      window.dispatchEvent(new CustomEvent("consentChange", { detail: mapped }));

      if (mapped.monitoring) {
        initObservability();
      }
    });
  }, [subscribeToConsentChanges]);

  return (
    <CookieBanner
      onAcceptAll={handleConsent}
      onRejectAll={() => {}}
      onSavePreferences={handleConsent}
    />
  );
}

export function ConsentProvider() {
  return (
    <ConsentManagerProvider
      options={{
        mode: "offline",
        noStyle: true,
        disableAnimation: true,
        consentCategories: ["necessary", "functionality", "measurement", "experience"],
        scripts,
        storageConfig: {
          storageKey: CONSENT_COOKIE_NAME,
          defaultExpiryDays: CONSENT_COOKIE_EXPIRY,
        },
      }}
    >
      <ConsentBannerInner />
    </ConsentManagerProvider>
  );
}
