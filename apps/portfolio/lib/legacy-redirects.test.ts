// @vitest-environment node
import { describe, expect, it } from "vitest";

import { LEGACY_REDIRECTS, legacyRedirects } from "./legacy-redirects";

describe("legacyRedirects", () => {
  it("redirects every legacy path permanently", () => {
    const redirects = legacyRedirects();
    for (const [source, destination] of Object.entries(LEGACY_REDIRECTS)) {
      expect(redirects).toContainEqual({ source, destination, permanent: true });
    }
    expect(redirects.every((redirect) => redirect.permanent)).toBe(true);
  });

  it("never chains: no destination is itself a redirect source", () => {
    const sources = new Set(legacyRedirects().map((redirect) => redirect.source));
    for (const redirect of legacyRedirects()) {
      expect(sources.has(redirect.destination)).toBe(false);
    }
  });

  it("keeps sources and destinations as absolute site paths", () => {
    for (const { source, destination } of legacyRedirects()) {
      expect(source).toMatch(/^\/[^?#]*$/);
      expect(destination).toMatch(/^\/[^?#]*$/);
      expect(source).not.toBe(destination);
    }
  });

  it("leaves /home alone for the Visual Editor", () => {
    const home = legacyRedirects().find((redirect) => redirect.source === "/home");
    expect(home).toMatchObject({ destination: "/", permanent: true });
    expect(home?.missing).toEqual(
      expect.arrayContaining([
        { type: "query", key: "_storyblok" },
        { type: "header", key: "sec-fetch-dest", value: "iframe" },
      ]),
    );
  });
});
