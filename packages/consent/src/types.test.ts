import { describe, expect, it } from "vitest";

import {
  cookieDatabaseCookieUrl,
  cookieDatabaseServiceUrl,
  COOKIE_DATABASE_ORIGIN,
  impliedConsent,
  isCategoryAllowed,
  OPT_OUT_CATEGORIES,
  SITE_COOKIES,
} from "./types";

describe("consent defaults and cookiedatabase helpers", () => {
  it("implies analytics on and media off before a decision", () => {
    expect(impliedConsent()).toEqual({
      analytics: true,
      monitoring: true,
      preferences: true,
      media: false,
    });
    expect(OPT_OUT_CATEGORIES.has("analytics")).toBe(true);
  });

  it("treats missing consent as allowed for opt-out categories only", () => {
    expect(isCategoryAllowed(null, "analytics")).toBe(true);
    expect(isCategoryAllowed(null, "media")).toBe(false);
    expect(isCategoryAllowed(null, "monitoring")).toBe(true);
  });

  it("builds cookiedatabase.org service and cookie URLs", () => {
    expect(cookieDatabaseServiceUrl("youtube")).toBe(`${COOKIE_DATABASE_ORIGIN}/service/youtube/`);
    expect(cookieDatabaseCookieUrl("youtube", "YSC")).toBe(
      `${COOKIE_DATABASE_ORIGIN}/cookie/youtube/ysc/`,
    );
  });

  it("lists site cookies with cookiedatabase links where known", () => {
    expect(SITE_COOKIES.some((cookie) => cookie.name === "httpjpg_consent")).toBe(true);
    expect(
      SITE_COOKIES.some(
        (cookie) => cookie.cookieDatabase?.startsWith(`${COOKIE_DATABASE_ORIGIN}/cookie/`) ?? false,
      ),
    ).toBe(true);
  });
});
