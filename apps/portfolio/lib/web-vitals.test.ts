// @vitest-environment node
import { formatVital, isVitalName, rateVital, VITAL_RATINGS } from "./web-vitals";

describe("isVitalName", () => {
  it("accepts the tracked core vitals", () => {
    expect(isVitalName("LCP")).toBe(true);
    expect(isVitalName("CLS")).toBe(true);
    expect(isVitalName("TTFB")).toBe(true);
    expect(isVitalName("FCP")).toBe(true);
    expect(isVitalName("INP")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isVitalName("CUSTOM_METRIC")).toBe(false);
    expect(isVitalName("lcp")).toBe(false);
    expect(isVitalName("")).toBe(false);
  });
});

describe("rateVital", () => {
  it("rates a value at or below the good threshold as good", () => {
    expect(rateVital("LCP", 2500)).toBe(VITAL_RATINGS.good);
    expect(rateVital("CLS", 0.1)).toBe(VITAL_RATINGS.good);
    expect(rateVital("TTFB", 120)).toBe(VITAL_RATINGS.good);
  });

  it("rates a value between the thresholds as needing improvement", () => {
    expect(rateVital("LCP", 3000)).toBe(VITAL_RATINGS.improve);
    expect(rateVital("CLS", 0.2)).toBe(VITAL_RATINGS.improve);
    expect(rateVital("INP", 500)).toBe(VITAL_RATINGS.improve);
  });

  it("rates a value above the poor threshold as poor", () => {
    expect(rateVital("LCP", 4001)).toBe(VITAL_RATINGS.poor);
    expect(rateVital("CLS", 0.4)).toBe(VITAL_RATINGS.poor);
    expect(rateVital("FCP", 5000)).toBe(VITAL_RATINGS.poor);
  });
});

describe("formatVital", () => {
  it("renders sub-second timings in milliseconds", () => {
    expect(formatVital("LCP", 340.4)).toBe("340ms");
    expect(formatVital("TTFB", 42)).toBe("42ms");
  });

  it("switches to seconds at a thousand milliseconds", () => {
    expect(formatVital("LCP", 2500)).toBe("2.5s");
    expect(formatVital("LCP", 1000)).toBe("1s");
    expect(formatVital("FCP", 1234)).toBe("1.23s");
  });

  it("renders CLS as a unitless ratio without trailing zeros", () => {
    expect(formatVital("CLS", 0.05)).toBe("0.05");
    expect(formatVital("CLS", 0.1)).toBe("0.1");
    expect(formatVital("CLS", 0)).toBe("0");
  });
});
