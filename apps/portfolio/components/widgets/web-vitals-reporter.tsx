"use client";

import { trackWebVital } from "@httpjpg/analytics";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";

type VitalName = "CLS" | "FCP" | "LCP" | "TTFB" | "INP";

const TRACKED: ReadonlySet<VitalName> = new Set(["CLS", "FCP", "LCP", "TTFB", "INP"]);
const GA_NAMES: ReadonlySet<Parameters<typeof trackWebVital>[0]> = new Set([
  "CLS",
  "FCP",
  "LCP",
  "TTFB",
  "INP",
]);

interface VitalMetricLike {
  name: string;
  value: number;
  rating?: "good" | "needs-improvement" | "poor";
  id?: string;
  navigationType?: string;
}

function postToVitals(payload: Record<string, unknown>): void {
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const queued = navigator.sendBeacon("/api/vitals", blob);
      if (queued) {
        return;
      }
    }
    void fetch("/api/vitals", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    });
  } catch {}
}

export function WebVitalsReporter() {
  const pathname = usePathname();

  useReportWebVitals((metric: VitalMetricLike) => {
    if (!TRACKED.has(metric.name as VitalName)) {
      return;
    }

    if (GA_NAMES.has(metric.name as Parameters<typeof trackWebVital>[0])) {
      trackWebVital(metric.name as Parameters<typeof trackWebVital>[0], metric.value);
    }

    postToVitals({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      pathname,
      navigationType: metric.navigationType,
    });
  });

  return null;
}
