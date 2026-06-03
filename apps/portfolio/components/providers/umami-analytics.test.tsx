import { describe, expect, it, vi } from "vitest";

vi.mock("next/script", () => ({ default: "script" }));

import { UmamiAnalytics } from "./umami-analytics";

describe("UmamiAnalytics", () => {
  it("renders the tracker script with the expected attributes", () => {
    const element = UmamiAnalytics({
      websiteId: "abc-123",
      src: "https://analytics.example.com/script.js",
    }) as { props: Record<string, unknown> };

    expect(element.props).toMatchObject({
      src: "https://analytics.example.com/script.js",
      "data-website-id": "abc-123",
      "data-do-not-track": "true",
      strategy: "afterInteractive",
    });
  });
});
