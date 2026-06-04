import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let reportCallback: ((metric: Record<string, unknown>) => void) | undefined;

vi.mock("@httpjpg/analytics", () => ({
  trackWebVital: vi.fn(),
}));

vi.mock("next/web-vitals", () => ({
  useReportWebVitals: vi.fn((cb: (metric: Record<string, unknown>) => void) => {
    reportCallback = cb;
  }),
}));

import { trackWebVital } from "@httpjpg/analytics";

import { WebVitalsReporter } from "./web-vitals-reporter";

describe("WebVitalsReporter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reportCallback = undefined;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  function renderAndReport(metric: Record<string, unknown>) {
    render(<WebVitalsReporter />);
    expect(reportCallback).toBeDefined();
    reportCallback!(metric);
  }

  it("forwards tracked vitals to the analytics providers", () => {
    render(<WebVitalsReporter />);

    reportCallback!({ name: "LCP", value: 2500 });
    reportCallback!({ name: "INP", value: 50 });

    expect(trackWebVital).toHaveBeenCalledTimes(2);
    expect(trackWebVital).toHaveBeenCalledWith("LCP", 2500);
    expect(trackWebVital).toHaveBeenCalledWith("INP", 50);
  });

  it("ignores untracked vital names", () => {
    renderAndReport({ name: "CUSTOM_METRIC", value: 999 });

    expect(trackWebVital).not.toHaveBeenCalled();
  });
});
