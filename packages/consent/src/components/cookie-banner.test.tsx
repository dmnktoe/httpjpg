import { fireEvent, render, screen } from "@testing-library/react";

import { clearConsent } from "../consent";
import { CookieBanner } from "./cookie-banner";

describe("CookieBanner", () => {
  beforeEach(() => {
    clearConsent();
  });

  it("renders the banner when no consent is stored", () => {
    render(<CookieBanner />);
    expect(screen.getByText(/Accept All/)).toBeInTheDocument();
    expect(screen.getByText(/Reject All/)).toBeInTheDocument();
  });

  it("reveals the preferences panel when Customize is clicked", () => {
    render(<CookieBanner />);
    fireEvent.click(screen.getByText(/Customize/));
    expect(screen.getByText(/Save Preferences/)).toBeInTheDocument();
  });
});
