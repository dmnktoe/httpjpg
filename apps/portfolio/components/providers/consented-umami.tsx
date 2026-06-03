"use client";

import { UmamiAnalytics, type UmamiAnalyticsProps } from "@httpjpg/analytics/umami";
import { hasVendorConsent } from "@httpjpg/consent";
import { useEffect, useState } from "react";

export function ConsentedUmami(props: UmamiAnalyticsProps) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(hasVendorConsent("umami"));
    sync();
    window.addEventListener("consentChange", sync);
    return () => window.removeEventListener("consentChange", sync);
  }, []);

  return allowed ? <UmamiAnalytics {...props} /> : null;
}
