import { clearConsent, type ConsentState, setConsent } from "@httpjpg/consent";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ConsentGate } from "./consent-gate";

const WITHOUT_ANALYTICS: ConsentState = {
  analytics: false,
  monitoring: true,
  preferences: true,
  media: false,
};
const WITH_ANALYTICS: ConsentState = { ...WITHOUT_ANALYTICS, analytics: true };

describe("ConsentGate", () => {
  beforeEach(() => {
    clearConsent();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders nothing without category consent", () => {
    setConsent(WITHOUT_ANALYTICS);

    render(
      <ConsentGate category="analytics">
        <div>tracker</div>
      </ConsentGate>,
    );

    expect(screen.queryByText("tracker")).toBeNull();
  });

  it("renders children once the category is granted", () => {
    setConsent(WITH_ANALYTICS);

    render(
      <ConsentGate category="analytics">
        <div>tracker</div>
      </ConsentGate>,
    );

    expect(screen.getByText("tracker")).toBeInTheDocument();
  });

  it("reacts to consent changes", () => {
    setConsent(WITHOUT_ANALYTICS);

    render(
      <ConsentGate category="analytics">
        <div>tracker</div>
      </ConsentGate>,
    );
    expect(screen.queryByText("tracker")).toBeNull();

    act(() => {
      setConsent(WITH_ANALYTICS);
    });

    expect(screen.getByText("tracker")).toBeInTheDocument();
  });
});
