"use client";

import { trackWebVital } from "@httpjpg/analytics";
import { useReportWebVitals } from "next/web-vitals";

import { isVitalName } from "@/lib/web-vitals";

interface VitalMetricLike {
  name: string;
  value: number;
}

export function WebVitalsReporter() {
  useReportWebVitals((metric: VitalMetricLike) => {
    if (!isVitalName(metric.name)) {
      return;
    }

    trackWebVital(metric.name, metric.value);
  });

  return null;
}
