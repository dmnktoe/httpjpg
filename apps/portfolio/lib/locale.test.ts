import {
  DEFAULT_LOCALE,
  firstSearchParam,
  htmlLangForPath,
  isAppLocale,
  localeAlternates,
  localeFromStoryblokLang,
  localizedPath,
  ogLocale,
  resolvePageLocale,
  splitLocaleSlug,
  storyblokLanguageParam,
} from "./locale";
import { STORYBLOK_SLUGS } from "./storyblok-slugs";

describe("isAppLocale", () => {
  it("accepts the configured locales", () => {
    expect(isAppLocale("en")).toBe(true);
    expect(isAppLocale("de")).toBe(true);
  });

  it("rejects unknown codes", () => {
    expect(isAppLocale("fr")).toBe(false);
    expect(isAppLocale("default")).toBe(false);
  });
});

describe("storyblokLanguageParam", () => {
  it("omits the default locale so the CDN serves the space default", () => {
    expect(storyblokLanguageParam(DEFAULT_LOCALE)).toBeUndefined();
  });

  it("forwards non-default locales as the CDN language code", () => {
    expect(storyblokLanguageParam("de")).toBe("de");
  });
});

describe("ogLocale", () => {
  it("maps app locales onto Open Graph locale tags", () => {
    expect(ogLocale("en")).toBe("en_US");
    expect(ogLocale("de")).toBe("de_DE");
  });
});

describe("firstSearchParam", () => {
  it("returns a string value as-is", () => {
    expect(firstSearchParam("de")).toBe("de");
  });

  it("takes the first value from an array", () => {
    expect(firstSearchParam(["de", "en"])).toBe("de");
  });

  it("returns undefined when the param is missing", () => {
    expect(firstSearchParam(undefined)).toBeUndefined();
  });
});

describe("localeFromStoryblokLang", () => {
  it("treats default and empty as English", () => {
    expect(localeFromStoryblokLang("default")).toBe("en");
    expect(localeFromStoryblokLang("")).toBe("en");
    expect(localeFromStoryblokLang(undefined)).toBe("en");
  });

  it("normalizes regional codes down to the language", () => {
    expect(localeFromStoryblokLang("de")).toBe("de");
    expect(localeFromStoryblokLang("de_DE")).toBe("de");
    expect(localeFromStoryblokLang("de-de")).toBe("de");
  });

  it("falls back to English for unknown editor values", () => {
    expect(localeFromStoryblokLang("fr")).toBe("en");
  });
});

describe("splitLocaleSlug", () => {
  it("leaves unprefixed slugs on the default locale", () => {
    expect(splitLocaleSlug(["cv"])).toEqual({ locale: "en", slug: STORYBLOK_SLUGS.CV });
    expect(splitLocaleSlug(["work", "foo"])).toEqual({ locale: "en", slug: "work/foo" });
    expect(splitLocaleSlug([])).toEqual({ locale: "en", slug: "" });
    expect(splitLocaleSlug(undefined)).toEqual({ locale: "en", slug: "" });
  });

  it("peels a locale prefix off localized stories", () => {
    expect(splitLocaleSlug(["de", "cv"])).toEqual({ locale: "de", slug: STORYBLOK_SLUGS.CV });
  });

  it("does not steal a story whose slug is the locale code", () => {
    expect(splitLocaleSlug(["de"])).toEqual({ locale: "en", slug: "de" });
  });

  it("does not prefix stories that are not in the localized set", () => {
    expect(splitLocaleSlug(["de", "work", "foo"])).toEqual({
      locale: "en",
      slug: "de/work/foo",
    });
  });
});

describe("localizedPath", () => {
  it("keeps English unprefixed", () => {
    expect(localizedPath("en", "cv")).toBe("/cv");
    expect(localizedPath("en", "")).toBe("/");
  });

  it("prefixes German localized stories", () => {
    expect(localizedPath("de", "cv")).toBe("/de/cv");
  });
});

describe("localeAlternates", () => {
  it("emits hreflang maps for localized slugs", () => {
    expect(localeAlternates("cv")).toEqual({
      en: "/cv",
      de: "/de/cv",
      "x-default": "/cv",
    });
  });

  it("returns nothing for stories without a language picker", () => {
    expect(localeAlternates("about")).toBeUndefined();
  });
});

describe("resolvePageLocale", () => {
  it("reads the public path prefix", () => {
    expect(resolvePageLocale({ segments: ["de", "cv"] })).toEqual({
      locale: "de",
      slug: "cv",
    });
  });

  it("lets the Visual Editor language override the path", () => {
    expect(resolvePageLocale({ segments: ["cv"], storyblokLang: "de" })).toEqual({
      locale: "de",
      slug: "cv",
    });
    expect(resolvePageLocale({ segments: ["de", "cv"], storyblokLang: "default" })).toEqual({
      locale: "en",
      slug: "cv",
    });
  });

  it("ignores a missing editor param and keeps the path locale", () => {
    expect(resolvePageLocale({ segments: ["cv"] })).toEqual({ locale: "en", slug: "cv" });
  });
});

describe("htmlLangForPath", () => {
  it("uses the path locale on localized stories", () => {
    expect(htmlLangForPath("/cv")).toBe("en");
    expect(htmlLangForPath("/de/cv")).toBe("de");
    expect(htmlLangForPath("/de/cv/")).toBe("de");
  });

  it("falls back to the CMS site locale on other routes", () => {
    expect(htmlLangForPath("/work/foo", "de")).toBe("de");
    expect(htmlLangForPath("/", "en")).toBe("en");
    expect(htmlLangForPath("/about")).toBe("en");
  });
});
