import { STORYBLOK_SLUGS } from "./storyblok-slugs";

export const APP_LOCALES = ["en", "de"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

/** Stories that expose a public locale prefix (`/de/cv`) and the language picker. */
export const LOCALIZED_SLUGS = new Set<string>([STORYBLOK_SLUGS.CV]);

export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}

/** CDN `language` param. Omit it for the space default so Storyblok does not 404. */
export function storyblokLanguageParam(locale: AppLocale): string | undefined {
  return locale === DEFAULT_LOCALE ? undefined : locale;
}

export function ogLocale(locale: AppLocale): string {
  return locale === "de" ? "de_DE" : "en_US";
}

export function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

/**
 * Map Storyblok Visual Editor `_storyblok_lang` onto an app locale.
 * `default` is the space's default language (English here).
 */
export function localeFromStoryblokLang(raw: string | string[] | undefined): AppLocale {
  const value = firstSearchParam(raw);
  if (!value || value === "default") {
    return DEFAULT_LOCALE;
  }
  const normalized = value.toLowerCase().replace(/-/g, "_").split("_")[0] ?? value;
  return isAppLocale(normalized) ? normalized : DEFAULT_LOCALE;
}

export interface LocaleSlug {
  locale: AppLocale;
  slug: string;
}

/**
 * Peel a public locale prefix off a catch-all slug (`de/cv` → `{ de, cv }`).
 * Only known localized stories get a prefix so a future `/de` story stays reachable.
 */
export function splitLocaleSlug(segments: readonly string[] | undefined): LocaleSlug {
  const parts = segments?.filter(Boolean) ?? [];
  const prefix = parts[0];
  if (prefix && isAppLocale(prefix) && prefix !== DEFAULT_LOCALE && parts.length >= 2) {
    const slug = parts.slice(1).join("/");
    if (LOCALIZED_SLUGS.has(slug)) {
      return { locale: prefix, slug };
    }
  }
  return { locale: DEFAULT_LOCALE, slug: parts.join("/") };
}

export function localizedPath(locale: AppLocale, slug: string): string {
  const path = slug ? `/${slug}` : "/";
  if (locale === DEFAULT_LOCALE) {
    return path;
  }
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function localeAlternates(slug: string): Record<string, string> | undefined {
  if (!LOCALIZED_SLUGS.has(slug)) {
    return undefined;
  }
  const en = localizedPath("en", slug);
  const de = localizedPath("de", slug);
  return { en, de, "x-default": en };
}

/** Public pages: path prefix wins. Visual Editor: `_storyblok_lang` is the source of truth. */
export function resolvePageLocale(args: {
  segments?: readonly string[];
  storyblokLang?: string | string[];
}): LocaleSlug {
  const split = splitLocaleSlug(args.segments);
  if (args.storyblokLang !== undefined) {
    return { locale: localeFromStoryblokLang(args.storyblokLang), slug: split.slug };
  }
  return split;
}

/** `<html lang>` for a request path; non-localized routes keep the CMS site locale. */
export function htmlLangForPath(pathname: string, fallback?: string): string {
  const trimmed = pathname.replace(/^\/+|\/+$/g, "");
  const { locale, slug } = splitLocaleSlug(trimmed ? trimmed.split("/") : []);
  if (LOCALIZED_SLUGS.has(slug)) {
    return locale;
  }
  return fallback || DEFAULT_LOCALE;
}
