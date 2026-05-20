"use client";

import { trackWebVital } from "@httpjpg/analytics";
import { useReportWebVitals } from "next/web-vitals";

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
