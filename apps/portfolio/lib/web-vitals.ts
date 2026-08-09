export const VITAL_NAMES = ["CLS", "FCP", "LCP", "TTFB", "INP"] as const;

export type VitalName = (typeof VITAL_NAMES)[number];

export const TRACKED_VITALS: ReadonlySet<VitalName> = new Set(VITAL_NAMES);

export const VITAL_RATINGS = {
  good: "good",
  improve: "improve",
  poor: "poor",
} as const;

export type VitalRating = (typeof VITAL_RATINGS)[keyof typeof VITAL_RATINGS];

const THRESHOLDS: Record<VitalName, { good: number; poor: number }> = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

export function isVitalName(value: string): value is VitalName {
  return TRACKED_VITALS.has(value as VitalName);
}

export function rateVital(name: VitalName, value: number): VitalRating {
  const { good, poor } = THRESHOLDS[name];
  if (value <= good) {
    return VITAL_RATINGS.good;
  }
  return value <= poor ? VITAL_RATINGS.improve : VITAL_RATINGS.poor;
}

export function formatVital(name: VitalName, value: number): string {
  if (name === "CLS") {
    return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}s`;
  }
  return `${Math.round(value)}ms`;
}
