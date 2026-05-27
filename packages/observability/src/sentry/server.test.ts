// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MockScope {
  setTag: ReturnType<typeof vi.fn>;
  setContext: ReturnType<typeof vi.fn>;
  setLevel: ReturnType<typeof vi.fn>;
  setFingerprint: ReturnType<typeof vi.fn>;
}

const mockScope: MockScope = {
  setTag: vi.fn(),
  setContext: vi.fn(),
  setLevel: vi.fn(),
  setFingerprint: vi.fn(),
};

vi.mock("@sentry/nextjs", () => ({
  withScope: vi.fn((cb: (s: MockScope) => void) => cb(mockScope)),
  captureMessage: vi.fn(),
  captureException: vi.fn(),
}));

import * as Sentry from "@sentry/nextjs";

import { captureServerException, captureWebVital, type WebVitalReport } from "./server";

describe("captureWebVital", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends a message with the vital name and value", () => {
    const metric: WebVitalReport = { name: "LCP", value: 2345.67 };

    captureWebVital(metric);

    expect(Sentry.captureMessage).toHaveBeenCalledWith("[vital] LCP=2345.67");
  });

  it("tags vital.name and vital.source on every call", () => {
    captureWebVital({ name: "CLS", value: 0.05 });

    expect(mockScope.setTag).toHaveBeenCalledWith("vital.name", "CLS");
    expect(mockScope.setTag).toHaveBeenCalledWith("vital.source", "web-vitals-route");
  });

  it("tags rating when provided", () => {
    captureWebVital({ name: "FCP", value: 1200, rating: "needs-improvement" });

    expect(mockScope.setTag).toHaveBeenCalledWith("vital.rating", "needs-improvement");
  });

  it("tags pathname when provided", () => {
    captureWebVital({ name: "TTFB", value: 80, pathname: "/work/project" });

    expect(mockScope.setTag).toHaveBeenCalledWith("vital.pathname", "/work/project");
  });

  it("truncates pathname exceeding 500 characters", () => {
    const longPath = "/" + "a".repeat(600);

    captureWebVital({ name: "LCP", value: 100, pathname: longPath });

    const contextCall = mockScope.setContext.mock.calls.find(
      (c: unknown[]) => c[0] === "web_vital",
    )!;
    expect(contextCall[1].pathname.length).toBe(500);
  });

  it("does not redundantly tag environment or release (handled by Sentry.init)", () => {
    captureWebVital({ name: "INP", value: 50 });

    const tagKeys = mockScope.setTag.mock.calls.map((c: unknown[]) => c[0]);
    expect(tagKeys).not.toContain("environment");
    expect(tagKeys).not.toContain("release");
  });

  it("sets level to warning for poor rating", () => {
    captureWebVital({ name: "CLS", value: 0.3, rating: "poor" });

    expect(mockScope.setLevel).toHaveBeenCalledWith("warning");
  });

  it("sets level to info for good rating", () => {
    captureWebVital({ name: "CLS", value: 0.01, rating: "good" });

    expect(mockScope.setLevel).toHaveBeenCalledWith("info");
  });

  it("sets level to info when no rating is provided", () => {
    captureWebVital({ name: "FID", value: 10 });

    expect(mockScope.setLevel).toHaveBeenCalledWith("info");
  });

  it("sets fingerprint to group by vital name", () => {
    captureWebVital({ name: "LCP", value: 2500 });

    expect(mockScope.setFingerprint).toHaveBeenCalledWith(["web-vital", "LCP"]);
  });

  it("passes full context with all optional fields", () => {
    const metric: WebVitalReport = {
      name: "LCP",
      value: 2500,
      rating: "poor",
      id: "v1-123",
      pathname: "/work",
      userAgent: "Mozilla/5.0",
      navigationType: "navigate",
    };

    captureWebVital(metric);

    expect(mockScope.setContext).toHaveBeenCalledWith("web_vital", {
      name: "LCP",
      value: 2500,
      rating: "poor",
      id: "v1-123",
      pathname: "/work",
      userAgent: "Mozilla/5.0",
      navigationType: "navigate",
    });
  });
});

describe("captureServerException", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("captures the error inside a withScope call", () => {
    const error = new Error("test");

    captureServerException(error);

    expect(Sentry.withScope).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it("sets tags on the isolated scope", () => {
    captureServerException(new Error("tagged"), {
      tags: { route: "/api/test", method: "GET" },
    });

    expect(mockScope.setTag).toHaveBeenCalledWith("route", "/api/test");
    expect(mockScope.setTag).toHaveBeenCalledWith("method", "GET");
  });

  it("sets extra context on the isolated scope", () => {
    captureServerException(new Error("extra"), {
      extra: { slug: "my-page", attempt: 3 },
    });

    expect(mockScope.setContext).toHaveBeenCalledWith("custom", {
      slug: "my-page",
      attempt: 3,
    });
  });

  it("works without context", () => {
    const error = new Error("bare");

    captureServerException(error);

    expect(mockScope.setTag).not.toHaveBeenCalled();
    expect(mockScope.setContext).not.toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });
});
