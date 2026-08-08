import { OPEN_COOKIE_SETTINGS_EVENT } from "@httpjpg/ui";
import { act, fireEvent, render, screen, within } from "@testing-library/react";

import { clearConsent, getConsent, setConsent } from "../consent";
import { CookieBanner } from "./cookie-banner";

// The category labels are rendered in small-caps unicode, so match on those.
const ANALYTICS = "ᴀɴᴀʟʏᴛɪᴄꜱ";
const MONITORING = "ᴍᴏɴɪᴛᴏʀɪɴɢ";

function customize() {
  fireEvent.click(screen.getByRole("button", { name: /⚙ Customize/ }));
}

function categoryRow(label: string) {
  const heading = screen.getByText(label, { exact: false });
  return heading.closest("div")?.parentElement as HTMLElement;
}

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
    customize();
    expect(screen.getByRole("button", { name: /Save Preferences/ })).toBeInTheDocument();
  });

  it("stays hidden once a decision has been stored", () => {
    setConsent({ analytics: true, monitoring: true, preferences: true, media: true });

    render(<CookieBanner />);

    expect(screen.queryByRole("button", { name: /Accept All/ })).not.toBeInTheDocument();
  });

  it("names the number of opt-in third parties", () => {
    render(<CookieBanner />);

    expect(screen.getByText(/trusted third-party services/)).toBeInTheDocument();
  });

  it("opens the details panel from the inline links", () => {
    render(<CookieBanner />);

    fireEvent.click(screen.getByRole("button", { name: /Privacy Policy/ }));

    expect(screen.getByRole("button", { name: /Save Preferences/ })).toBeInTheDocument();
  });

  it("grants every category on Accept All", () => {
    const onAcceptAll = vi.fn();
    render(<CookieBanner onAcceptAll={onAcceptAll} />);

    fireEvent.click(screen.getByRole("button", { name: /Accept All/ }));

    const expected = { analytics: true, monitoring: true, preferences: true, media: true };
    expect(onAcceptAll).toHaveBeenCalledWith(expected);
    expect(getConsent()).toMatchObject(expected);
    expect(screen.queryByRole("button", { name: /Accept All/ })).not.toBeInTheDocument();
  });

  it("stores the default state on Reject All", () => {
    const onRejectAll = vi.fn();
    render(<CookieBanner onRejectAll={onRejectAll} />);

    fireEvent.click(screen.getByRole("button", { name: /Reject All/ }));

    expect(onRejectAll).toHaveBeenCalledOnce();
    expect(getConsent()).toMatchObject({ analytics: false, media: false });
    expect(screen.queryByRole("button", { name: /Reject All/ })).not.toBeInTheDocument();
  });

  it("saves the categories the visitor picked", () => {
    const onSavePreferences = vi.fn();
    render(<CookieBanner onSavePreferences={onSavePreferences} />);
    customize();

    fireEvent.click(screen.getByRole("checkbox", { name: ANALYTICS }));
    fireEvent.click(screen.getByRole("button", { name: /Save Preferences/ }));

    expect(onSavePreferences).toHaveBeenCalledWith(expect.objectContaining({ analytics: true }));
    expect(getConsent()).toMatchObject({ analytics: true });
  });

  it("locks the required categories on", () => {
    render(<CookieBanner />);
    customize();

    const required = screen.getByRole("checkbox", { name: `${MONITORING} (Required)` });

    expect(required).toBeChecked();
    expect(required).toBeDisabled();
  });

  it("expands and collapses a category's vendor list", () => {
    render(<CookieBanner />);
    customize();
    const row = categoryRow(ANALYTICS);
    const toggle = within(row).getByRole("button");

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent("▼");

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent("▶");
  });

  it("re-opens on the cookie settings event with the stored consent", () => {
    setConsent({ analytics: true, monitoring: true, preferences: false, media: false });
    render(<CookieBanner />);
    expect(screen.queryByRole("button", { name: /Accept All/ })).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
    });

    expect(screen.getByRole("button", { name: /Save Preferences/ })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: ANALYTICS })).toBeChecked();
  });

  it("re-opens on the settings event even with no stored consent", () => {
    render(<CookieBanner />);

    act(() => {
      window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
    });

    expect(screen.getByRole("button", { name: /Save Preferences/ })).toBeInTheDocument();
  });

  it("stops listening for the settings event after unmount", () => {
    const { unmount } = render(<CookieBanner />);
    fireEvent.click(screen.getByRole("button", { name: /Accept All/ }));
    unmount();

    act(() => {
      window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
    });

    expect(screen.queryByRole("button", { name: /Accept All/ })).not.toBeInTheDocument();
  });
});
