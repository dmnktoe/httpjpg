import { clearConsent, getConsent, hasConsent, hasVendorConsent, setConsent } from "./consent";
import { CONSENT_CHANGE_EVENT } from "./events";
import { CONSENT_COOKIE_NAME, CONSENT_VERSION, type ConsentState } from "./types";

const FULL: ConsentState = { analytics: true, monitoring: true, preferences: true, media: true };
const DEFAULT: ConsentState = {
  analytics: false,
  monitoring: true,
  preferences: true,
  media: false,
};

function writeRawCookie(value: string) {
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(value)}; path=/`;
}

describe("consent storage", () => {
  beforeEach(() => {
    clearConsent();
  });

  it("round-trips consent through the cookie", () => {
    setConsent(FULL);
    expect(getConsent()).toEqual(FULL);
    expect(hasConsent()).toBe(true);
  });

  it("forces required categories on, even if stored as false", () => {
    setConsent({ ...FULL, monitoring: false, preferences: false });
    expect(getConsent()).toMatchObject({ monitoring: true, preferences: true });
  });

  it("treats consent from a different version as absent", () => {
    writeRawCookie(JSON.stringify({ v: CONSENT_VERSION + 1, consent: FULL }));
    expect(getConsent()).toBeNull();
    expect(hasConsent()).toBe(false);
  });

  it("ignores a malformed cookie", () => {
    writeRawCookie("not json");
    expect(getConsent()).toBeNull();
  });

  it("does not throw on a cookie with invalid percent-encoding", () => {
    document.cookie = `${CONSENT_COOKIE_NAME}=100%zz; path=/`;
    expect(() => getConsent()).not.toThrow();
    expect(getConsent()).toBeNull();
  });

  it("normalizes a partial consent object against defaults", () => {
    writeRawCookie(JSON.stringify({ v: CONSENT_VERSION, consent: { analytics: true } }));
    expect(getConsent()).toEqual({ ...DEFAULT, analytics: true });
  });

  it("maps vendor consent to its category", () => {
    setConsent(DEFAULT);
    expect(hasVendorConsent("spotify")).toBe(false);
    setConsent({ ...DEFAULT, media: true });
    expect(hasVendorConsent("spotify")).toBe(true);
  });

  it("dispatches a consentChange event on set and clear", () => {
    const events: Array<ConsentState | null> = [];
    const listener = (event: Event) =>
      events.push((event as CustomEvent<ConsentState | null>).detail);
    window.addEventListener(CONSENT_CHANGE_EVENT, listener);

    setConsent(FULL);
    clearConsent();

    window.removeEventListener(CONSENT_CHANGE_EVENT, listener);
    expect(events).toEqual([FULL, null]);
  });
});
