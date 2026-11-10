import type { NextConfig } from "next";

type Redirect = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>[number];

/**
 * Old public paths that still get crawled, mapped to where the content lives now.
 *
 * Only list a path when its successor is certain. Removed pages without a
 * successor stay out: they already answer `noindex` and drop out of the index.
 */
export const LEGACY_REDIRECTS: Readonly<Record<string, string>> = {
  // Renamed work stories (old Storyblok slugs).
  "/work/2023_04_14_outlet-label-store-cgi-te3shay-mix_html": "/work/outlet-store",
  "/work/patterns-in-a-chromatic-field-peaceful-destruction_html":
    "/work/patterns-in-a-chromatic-field",
  "/work/radio-rasclat-four-years-of-transmission": "/work/radio-rasclat",
  "/work/sentiment-it-security-protects-privacy-and-supports-democracy": "/work/sentiment",
  // No work index or German home; the work list lives on the root.
  "/work": "/",
  "/de": "/",
};

/**
 * `/home` serves the root story and only carries a canonical to `/`.
 * The Visual Editor may still open it, so editor requests are left alone.
 */
const HOME_REDIRECT: Redirect = {
  source: "/home",
  destination: "/",
  permanent: true,
  missing: [
    { type: "query", key: "_storyblok" },
    { type: "query", key: "_draft" },
    { type: "header", key: "sec-fetch-dest", value: "iframe" },
  ],
};

export function legacyRedirects(): Redirect[] {
  return [
    HOME_REDIRECT,
    ...Object.entries(LEGACY_REDIRECTS).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    })),
  ];
}
