import { describe, expect, it } from "vitest";

import type { PaletteLink } from "@/lib/queries/config";

import { filterPaletteLinks, mergePaletteResults } from "./palette-links";

const LINKS: PaletteLink[] = [
  { id: "nav:/work", title: "Projects", href: "/work", kind: "nav", excerpt: "header" },
  {
    id: "social:https://github.com/dmnktoe",
    title: "GitHub",
    href: "https://github.com/dmnktoe",
    kind: "social",
    excerpt: "profile",
  },
];

describe("filterPaletteLinks", () => {
  it("returns every link when the query is empty", () => {
    expect(filterPaletteLinks(LINKS, "  ")).toEqual(LINKS);
  });

  it("matches title substrings case-insensitively", () => {
    expect(filterPaletteLinks(LINKS, "git")).toEqual([LINKS[1]]);
  });

  it("matches href substrings", () => {
    expect(filterPaletteLinks(LINKS, "/work")).toEqual([LINKS[0]]);
  });
});

describe("mergePaletteResults", () => {
  it("puts palette links ahead of search results and drops href dupes", () => {
    expect(
      mergePaletteResults(LINKS, [
        { id: "1", title: "Projects page", href: "/work", kind: "page" },
        { id: "2", title: "Brutalist", href: "/work/brutalist", kind: "work" },
      ]),
    ).toEqual([
      {
        id: "nav:/work",
        title: "Projects",
        href: "/work",
        kind: "nav",
        excerpt: "header",
      },
      {
        id: "social:https://github.com/dmnktoe",
        title: "GitHub",
        href: "https://github.com/dmnktoe",
        kind: "social",
        excerpt: "profile",
      },
      { id: "2", title: "Brutalist", href: "/work/brutalist", kind: "work" },
    ]);
  });
});
