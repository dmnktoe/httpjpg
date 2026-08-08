"use client";

import { Box } from "@httpjpg/ui";
import { useReportWebVitals } from "next/web-vitals";
import { useState } from "react";

import {
  formatVital,
  isVitalName,
  rateVital,
  VITAL_RATINGS,
  type VitalName,
  type VitalRating,
} from "@/lib/web-vitals";

const SHOWN: readonly VitalName[] = ["LCP", "CLS", "TTFB"];

const RATING_COLORS: Record<VitalRating, string> = {
  [VITAL_RATINGS.good]: "success.500",
  [VITAL_RATINGS.improve]: "warning.500",
  [VITAL_RATINGS.poor]: "danger.500",
};

interface VitalMetricLike {
  name: string;
  value: number;
}

export function WebVitalsBadge() {
  const [vitals, setVitals] = useState<Partial<Record<VitalName, number>>>({});

  useReportWebVitals((metric: VitalMetricLike) => {
    if (!isVitalName(metric.name) || !SHOWN.includes(metric.name)) {
      return;
    }
    setVitals((current) => ({ ...current, [metric.name as VitalName]: metric.value }));
  });

  const measured = SHOWN.filter((name) => vitals[name] !== undefined);
  if (measured.length === 0) {
    return null;
  }

  return (
    <Box
      css={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        minHeight: "5",
        opacity: 80,
        fontFamily: "mono",
        fontSize: "xs",
      }}
    >
      <Box as="span" css={{ opacity: 60 }}>
        vitals:
      </Box>
      {measured.map((name, index) => {
        const value = vitals[name] as number;
        return (
          <Box key={name} as="span" css={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
            {index > 0 && (
              <Box as="span" css={{ mr: 1, opacity: 40 }}>
                ·
              </Box>
            )}
            <Box as="span" css={{ opacity: 50 }}>
              {name}
            </Box>
            <Box as="span" css={{ color: RATING_COLORS[rateVital(name, value)], opacity: 80 }}>
              {formatVital(name, value)}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
