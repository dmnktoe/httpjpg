// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { APP_PAGE_ROUTES, REWRITTEN_ROUTES, storySlugForPath } from "./story-route";

describe("storySlugForPath", () => {
  it.each([
    ["/about", "about"],
    ["/work/atlas/", "work/atlas"],
    ["/feed/20261125-153012-a3f9", "feed/20261125-153012-a3f9"],
    ["/feed-xml_html", "feed-xml_html"],
    ["/de/cv", "cv"],
    ["/de/about", "de/about"],
    ["/caf%C3%A9", "café"],
    ["/api", "api"],
  ])("reads %s as the story %s", (pathname, slug) => {
    expect(storySlugForPath(pathname)).toBe(slug);
  });

  it.each([
    ["the root", "/"],
    ["a route of its own", "/feed"],
    ["another route of its own", "/cookie-policy/"],
    ["an API path", "/api/feed/posts"],
    ["the draft entry", "/draft"],
    ["the draft exit", "/exit-draft"],
    ["a framework path", "/_next/data/x.json"],
    ["a well-known path", "/.well-known/security.txt"],
    ["a malformed escape", "/%E0%A4%A"],
  ])("leaves %s alone", (_label, pathname) => {
    expect(storySlugForPath(pathname)).toBeNull();
  });

  it("lists exactly the page routes that have their own page file", () => {
    const group = fileURLToPath(new URL("../app/(portfolio)", import.meta.url));
    const routes = readdirSync(group).filter((entry) => {
      const directory = join(group, entry);
      return (
        statSync(directory).isDirectory() &&
        !entry.startsWith("[") &&
        readdirSync(directory).includes("page.tsx")
      );
    });

    expect([...APP_PAGE_ROUTES].sort()).toEqual(routes.sort());
  });

  it("lists exactly the paths next.config rewrites", () => {
    const config = readFileSync(
      fileURLToPath(new URL("../next.config.ts", import.meta.url)),
      "utf8",
    );
    const sources = [...config.matchAll(/source:\s*"\/([^"/]+)"/g)].map((match) => match[1]);

    expect(sources.length).toBeGreaterThan(0);
    expect([...REWRITTEN_ROUTES].sort()).toEqual(sources.sort());
  });
});
