import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let reportCallback: ((metric: Record<string, unknown>) => void) | undefined;

vi.mock("@httpjpg/analytics", () => ({
  trackWebVital: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/work/project",
}));

vi.mock("next/web-vitals", () => ({
  useReportWebVitals: vi.fn((cb: (metric: Record<string, unknown>) => void) => {
    reportCallback = cb;
  }),
}));

import { trackWebVital } from "@httpjpg/analytics";

import { WebVitalsReporter } from "./web-vitals-reporter";

describe("WebVitalsReporter", () => {
  let sendBeaconSpy: ReturnType<typeof vi.fn>;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    reportCallback = undefined;
    sendBeaconSpy = vi.fn(() => true);
    fetchSpy = vi.fn(() => Promise.resolve(new Response()));
    Object.defineProperty(globalThis, "navigator", {
      value: { sendBeacon: sendBeaconSpy },
      writable: true,
      configurable: true,
    });
    vi.stubGlobal("fetch", fetchSpy);
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

  it("sends tracked vitals via sendBeacon", () => {
    renderAndReport({ name: "LCP", value: 2500, rating: "poor", id: "v1-1" });

    expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
    const [url, blob] = sendBeaconSpy.mock.calls[0];
    expect(url).toBe("/api/vitals");
    expect(blob).toBeInstanceOf(Blob);
  });

  it("falls back to fetch when sendBeacon returns false", () => {
    sendBeaconSpy.mockReturnValueOnce(false);

    renderAndReport({ name: "CLS", value: 0.05 });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/vitals",
      expect.objectContaining({ method: "POST", keepalive: true }),
    );
  });

  it("falls back to fetch when sendBeacon is unavailable", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      writable: true,
      configurable: true,
    });

    renderAndReport({ name: "FCP", value: 1200 });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

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

    expect(sendBeaconSpy).not.toHaveBeenCalled();
    expect(trackWebVital).not.toHaveBeenCalled();
  });

  it("includes pathname from usePathname in the payload", async () => {
    renderAndReport({
      name: "TTFB",
      value: 80,
      rating: "good",
      id: "v1-2",
      navigationType: "navigate",
    });

    const blob = sendBeaconSpy.mock.calls[0][1] as Blob;
    const text = await blob.text();
    const payload = JSON.parse(text);
    expect(payload.pathname).toBe("/work/project");
    expect(payload.navigationType).toBe("navigate");
  });

  it("does not throw when both sendBeacon and fetch fail", () => {
    sendBeaconSpy.mockImplementation(() => {
      throw new Error("sendBeacon failed");
    });

    expect(() => renderAndReport({ name: "LCP", value: 100 })).not.toThrow();
  });
});
