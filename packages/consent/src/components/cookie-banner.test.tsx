import { fireEvent, render, screen } from "@testing-library/react";

import { clearConsent } from "../consent";
import { CookieBanner } from "./cookie-banner";

describe("CookieBanner", () => {
  beforeEach(() => {
    clearConsent();
  });

  it("renders the banner when no consent is stored", () => {
    render(<CookieBanner />);
    expect(screen.getByRole("button", { name: /Accept All/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reject All/ })).toBeInTheDocument();
  });

  it("reveals the preferences panel when Customize is clicked", () => {
    render(<CookieBanner />);
    fireEvent.click(screen.getByRole("button", { name: /⚙ Customize/ }));
    expect(screen.getByRole("button", { name: /Save Preferences/ })).toBeInTheDocument();
  });
});
