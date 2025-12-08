"use client";

import { trackWebVital } from "@httpjpg/analytics";
import { useReportWebVitals } from "next/web-vitals";

/**
 * Web Vitals Reporter
 * Automatically tracks Core Web Vitals to Google Analytics
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    switch (metric.name) {
      case "CLS":
      case "FID":
      case "FCP":
      case "LCP":
      case "TTFB":
        trackWebVital(metric.name, metric.value);
        break;
    }
  });

  return null;
}
