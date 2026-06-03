import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@httpjpg/consent", () => ({
  getConsent: vi.fn(),
}));

import { getConsent } from "@httpjpg/consent";

import { ConsentGate } from "./consent-gate";

const mockedGetConsent = vi.mocked(getConsent);

describe("ConsentGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders nothing without category consent", () => {
    mockedGetConsent.mockReturnValue({
      analytics: false,
      monitoring: true,
      preferences: true,
      media: false,
    });

    render(
      <ConsentGate category="analytics">
        <div>tracker</div>
      </ConsentGate>,
    );

    expect(screen.queryByText("tracker")).toBeNull();
  });

  it("renders children once the category is granted", () => {
    mockedGetConsent.mockReturnValue({
      analytics: true,
      monitoring: true,
      preferences: true,
      media: false,
    });

    render(
      <ConsentGate category="analytics">
        <div>tracker</div>
      </ConsentGate>,
    );

    expect(screen.getByText("tracker")).toBeInTheDocument();
  });

  it("reacts to consentChange events", () => {
    mockedGetConsent.mockReturnValue({
      analytics: false,
      monitoring: true,
      preferences: true,
      media: false,
    });

    render(
      <ConsentGate category="analytics">
        <div>tracker</div>
      </ConsentGate>,
    );
    expect(screen.queryByText("tracker")).toBeNull();

    mockedGetConsent.mockReturnValue({
      analytics: true,
      monitoring: true,
      preferences: true,
      media: false,
    });
    act(() => {
      window.dispatchEvent(new CustomEvent("consentChange"));
    });

    expect(screen.getByText("tracker")).toBeInTheDocument();
  });
});
