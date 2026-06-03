import { act, fireEvent, render, screen } from "@testing-library/react";

import { clearConsent, getConsent, setConsent } from "../consent";
import { CookieCenter } from "./cookie-center";

const FULL_CONSENT = { analytics: true, monitoring: true, preferences: true, media: true };
const DEFAULT_CONSENT = { analytics: false, monitoring: true, preferences: true, media: false };

// Categories render in a fixed order: preferences, monitoring, analytics, media.
const ANALYTICS_INDEX = 2;
const MEDIA_INDEX = 3;

describe("CookieCenter", () => {
  beforeEach(() => {
    clearConsent();
  });

  it("renders every consent category", () => {
    render(<CookieCenter />);
    expect(screen.getByText(/ᴘʀᴇꜰᴇʀᴇɴᴄᴇꜱ/)).toBeInTheDocument();
    expect(screen.getByText(/ᴍᴏɴɪᴛᴏʀɪɴɢ/)).toBeInTheDocument();
    expect(screen.getByText(/ᴀɴᴀʟʏᴛɪᴄꜱ/)).toBeInTheDocument();
    expect(screen.getByText(/ᴍᴇᴅɪᴀ/)).toBeInTheDocument();
  });

  it("persists full consent and confirms when Accept All is clicked", () => {
    const onSave = vi.fn();
    render(<CookieCenter onSave={onSave} />);

    fireEvent.click(screen.getByRole("button", { name: /Accept All/ }));

    expect(getConsent()).toEqual(FULL_CONSENT);
    expect(onSave).toHaveBeenCalledWith(FULL_CONSENT);
    expect(screen.getByText(/Preferences saved/)).toBeInTheDocument();
  });

  it("persists the default (minimal) consent when Reject All is clicked", () => {
    render(<CookieCenter />);

    fireEvent.click(screen.getByRole("button", { name: /Reject All/ }));

    expect(getConsent()).toEqual(DEFAULT_CONSENT);
  });

  it("saves an opted-in optional category via Save Preferences", () => {
    render(<CookieCenter />);

    fireEvent.click(screen.getAllByRole("checkbox")[ANALYTICS_INDEX]);
    fireEvent.click(screen.getByRole("button", { name: /Save Preferences/ }));

    expect(getConsent()?.analytics).toBe(true);
    expect(getConsent()?.media).toBe(false);
  });

  it("hydrates from previously stored consent on mount", () => {
    setConsent(FULL_CONSENT);
    render(<CookieCenter />);

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes[MEDIA_INDEX].checked).toBe(true);
  });

  it("stays in sync when consent changes elsewhere (e.g. the cookie banner)", () => {
    render(<CookieCenter />);

    let checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes[MEDIA_INDEX].checked).toBe(false);

    // Simulate the visitor pressing "Accept All" in the banner.
    act(() => {
      setConsent(FULL_CONSENT);
    });

    checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes[MEDIA_INDEX].checked).toBe(true);
  });
});
