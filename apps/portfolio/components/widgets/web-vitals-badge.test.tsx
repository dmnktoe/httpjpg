import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let reportCallback: ((metric: Record<string, unknown>) => void) | undefined;
const registeredCallbacks: Array<(metric: Record<string, unknown>) => void> = [];

vi.mock("next/web-vitals", () => ({
  useReportWebVitals: vi.fn((cb: (metric: Record<string, unknown>) => void) => {
    reportCallback = cb;
    registeredCallbacks.push(cb);
  }),
}));

import { WebVitalsBadge } from "./web-vitals-badge";

function report(metric: Record<string, unknown>) {
  act(() => {
    reportCallback!(metric);
  });
}

describe("WebVitalsBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reportCallback = undefined;
    registeredCallbacks.length = 0;
  });

  afterEach(() => {
    cleanup();
  });

  it("holds the row with a loading label before the first metric arrives", () => {
    render(<WebVitalsBadge />);

    expect(screen.getByText("vitals:")).toBeInTheDocument();
    expect(screen.getByText("loading ...")).toBeInTheDocument();
  });

  it("swaps the loading label for the metric once it is reported", () => {
    render(<WebVitalsBadge />);

    report({ name: "LCP", value: 340 });

    expect(screen.getByText("vitals:")).toBeInTheDocument();
    expect(screen.queryByText("loading ...")).not.toBeInTheDocument();
    expect(screen.getByText("LCP")).toBeInTheDocument();
    expect(screen.getByText("340ms")).toBeInTheDocument();
  });

  it("accumulates the shown metrics in a fixed order", () => {
    render(<WebVitalsBadge />);

    report({ name: "TTFB", value: 42 });
    report({ name: "LCP", value: 340 });
    report({ name: "CLS", value: 0.05 });

    const names = screen.getAllByText(/^(LCP|CLS|TTFB)$/).map((node) => node.textContent);
    expect(names).toEqual(["LCP", "CLS", "TTFB"]);
  });

  it("ignores vitals it does not display", () => {
    render(<WebVitalsBadge />);

    report({ name: "INP", value: 50 });

    expect(screen.queryByText("INP")).not.toBeInTheDocument();
  });

  it("ignores metric names that are not core vitals", () => {
    render(<WebVitalsBadge />);

    report({ name: "CUSTOM_METRIC", value: 999 });

    expect(screen.getByText("loading ...")).toBeInTheDocument();
  });

  it("replaces an earlier value when the metric is reported again", () => {
    render(<WebVitalsBadge />);

    report({ name: "CLS", value: 0.05 });
    report({ name: "CLS", value: 0.2 });

    expect(screen.getByText("0.2")).toBeInTheDocument();
    expect(screen.queryByText("0.05")).not.toBeInTheDocument();
  });

  it("keeps one stable callback across re-renders so observers are not stacked", () => {
    render(<WebVitalsBadge />);

    report({ name: "TTFB", value: 42 });
    report({ name: "LCP", value: 340 });
    report({ name: "CLS", value: 0.05 });

    expect(new Set(registeredCallbacks).size).toBe(1);
  });
});
