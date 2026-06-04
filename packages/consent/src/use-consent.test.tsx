import { act, render, screen } from "@testing-library/react";

import { clearConsent, setConsent } from "./consent";
import type { ConsentState } from "./types";
import { useConsent, useConsentCategory, useVendorConsent } from "./use-consent";

const WITH_MEDIA: ConsentState = {
  analytics: false,
  monitoring: true,
  preferences: true,
  media: true,
};

function CategoryProbe() {
  return <div>analytics:{String(useConsentCategory("analytics"))}</div>;
}

function VendorProbe() {
  return <div>spotify:{String(useVendorConsent("spotify"))}</div>;
}

function ConsentProbe() {
  return <div>state:{useConsent() ? "present" : "absent"}</div>;
}

describe("consent hooks", () => {
  beforeEach(() => {
    clearConsent();
  });

  it("useConsentCategory reflects and reacts to changes", () => {
    render(<CategoryProbe />);
    expect(screen.getByText("analytics:false")).toBeInTheDocument();

    act(() => {
      setConsent({ ...WITH_MEDIA, analytics: true });
    });
    expect(screen.getByText("analytics:true")).toBeInTheDocument();
  });

  it("useVendorConsent maps a vendor to its category", () => {
    render(<VendorProbe />);
    expect(screen.getByText("spotify:false")).toBeInTheDocument();

    act(() => {
      setConsent(WITH_MEDIA);
    });
    expect(screen.getByText("spotify:true")).toBeInTheDocument();
  });

  it("useConsent reports presence of stored consent", () => {
    render(<ConsentProbe />);
    expect(screen.getByText("state:absent")).toBeInTheDocument();

    act(() => {
      setConsent(WITH_MEDIA);
    });
    expect(screen.getByText("state:present")).toBeInTheDocument();
  });
});
