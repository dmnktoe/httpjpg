import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import { clearConsent, setConsent } from "./consent";
import { CONSENT_COOKIE_NAME, CONSENT_VERSION, type ConsentState } from "./types";
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

function NoVendorProbe() {
  return <div>none:{String(useVendorConsent(null))}</div>;
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
    // Analytics is opt-out: allowed before any stored decision.
    expect(screen.getByText("analytics:true")).toBeInTheDocument();

    act(() => {
      setConsent(WITH_MEDIA);
    });
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

  it("useVendorConsent allows sources that need no vendor", () => {
    render(<NoVendorProbe />);
    expect(screen.getByText("none:true")).toBeInTheDocument();
  });

  it("re-reads the cookie on window focus", () => {
    render(<ConsentProbe />);
    expect(screen.getByText("state:absent")).toBeInTheDocument();

    const stored = { v: CONSENT_VERSION, consent: WITH_MEDIA };
    document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(stored))}; path=/`;
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    expect(screen.getByText("state:present")).toBeInTheDocument();
  });

  it("renders the no-decision defaults on the server", () => {
    setConsent(WITH_MEDIA);

    const html = renderToString(
      <>
        <ConsentProbe />
        <CategoryProbe />
        <VendorProbe />
        <NoVendorProbe />
      </>,
    ).replaceAll("<!-- -->", "");

    expect(html).toContain("state:absent");
    expect(html).toContain("analytics:true");
    expect(html).toContain("spotify:false");
    expect(html).toContain("none:true");
  });
});
