"use client";

import { Box } from "@httpjpg/ui";
import { useReportWebVitals } from "next/web-vitals";
import { useCallback, useState } from "react";

import {
  formatVital,
  isVitalName,
  rateVital,
  VITAL_NAMES,
  VITAL_RATINGS,
  type VitalName,
  type VitalRating,
} from "@/lib/web-vitals";

/**
 * Core Web Vitals for the visitor's own page load.
 *
 * Deliberately not "the site's p75": nothing stores vitals across sessions, so
 * a percentile would be invented. One honest sample beats a fabricated
 * aggregate, and the label says which it is.
 */

interface VitalMetricLike {
  name: string;
  value: number;
}

const RATING_COLOR: Record<VitalRating, string> = {
  [VITAL_RATINGS.good]: "success.500",
  [VITAL_RATINGS.improve]: "warning.500",
  [VITAL_RATINGS.poor]: "danger.500",
};

export function SessionVitals() {
  const [vitals, setVitals] = useState<Partial<Record<VitalName, number>>>({});

  // `useReportWebVitals` keys its effect on the callback and never
  // unsubscribes, so a fresh closure each render would stack observers.
  const reportVital = useCallback((metric: VitalMetricLike) => {
    if (!isVitalName(metric.name)) {
      return;
    }
    setVitals((current) =>
      current[metric.name as VitalName] === metric.value
        ? current
        : { ...current, [metric.name]: metric.value },
    );
  }, []);

  useReportWebVitals(reportVital);

  return (
    <Box
      as="dl"
      css={{
        display: "grid",
        gridTemplateColumns: { base: "repeat(2, 1fr)", sm: "repeat(5, 1fr)" },
        gap: "4",
        fontFamily: "mono",
        fontSize: "sm",
      }}
    >
      {VITAL_NAMES.map((name) => {
        const value = vitals[name];
        return (
          <Box key={name}>
            <Box as="dt" css={{ opacity: 0.4, fontSize: "xs", letterSpacing: "0.1em" }}>
              {name}
            </Box>
            <Box
              as="dd"
              css={{
                mt: "1",
                color: value === undefined ? "inherit" : RATING_COLOR[rateVital(name, value)],
                opacity: value === undefined ? 0.3 : 1,
              }}
            >
              {value === undefined ? "—" : formatVital(name, value)}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
