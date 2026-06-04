"use client";

import { trackWebVital } from "@httpjpg/analytics";
import { useReportWebVitals } from "next/web-vitals";

type VitalName = "CLS" | "FCP" | "LCP" | "TTFB" | "INP";

const TRACKED: ReadonlySet<VitalName> = new Set(["CLS", "FCP", "LCP", "TTFB", "INP"]);

interface VitalMetricLike {
  name: string;
  value: number;
}

export function WebVitalsReporter() {
  useReportWebVitals((metric: VitalMetricLike) => {
    if (!TRACKED.has(metric.name as VitalName)) {
      return;
    }

    trackWebVital(metric.name as VitalName, metric.value);
  });

  return null;
}
