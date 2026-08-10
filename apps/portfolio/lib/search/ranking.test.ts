import {
  normalize,
  rankDocuments,
  type SearchDocument,
  suggestCompletions,
  tokenize,
} from "./ranking";

function doc(overrides: Partial<SearchDocument> & { title: string }): SearchDocument {
  return {
    id: overrides.title,
    href: `/work/${overrides.title.toLowerCase().replace(/\s+/g, "-")}`,
    kind: "work",
    tags: [],
    tagValues: [],
    excerpt: "",
    ...overrides,
  };
}

const DOCUMENTS: SearchDocument[] = [
  doc({
    title: "Brutalist Portfolio",
    tags: ["Websites"],
    excerpt: "A stark site",
    date: "2025-01-01",
  }),
  doc({ title: "Poster Series", tags: ["Projects", "Print"], excerpt: "Risograph posters" }),
  doc({ title: "Archive", tags: [], excerpt: "An old brutalist experiment", date: "2024-01-01" }),
];

describe("normalize", () => {
  it("lowercases, strips diacritics, and drops punctuation", () => {
    expect(normalize("Müller's — Studio!")).toBe("muller s studio");
  });

  it("collapses whitespace", () => {
    expect(normalize("  a   b  ")).toBe("a b");
  });
});

describe("tokenize", () => {
  it("drops single-character noise", () => {
    expect(tokenize("a poster series")).toEqual(["poster", "series"]);
  });
});

describe("rankDocuments", () => {
  it("returns nothing for an empty or punctuation-only query", () => {
    expect(rankDocuments(DOCUMENTS, "")).toEqual([]);
    expect(rankDocuments(DOCUMENTS, "!!!")).toEqual([]);
  });

  it("ranks a title match above a body-text match", () => {
    const results = rankDocuments(DOCUMENTS, "brutalist");

    expect(results.map((result) => result.title)).toEqual(["Brutalist Portfolio", "Archive"]);
  });

  it("scores an exact title match highest", () => {
    const results = rankDocuments(DOCUMENTS, "poster series");

    expect(results[0]?.title).toBe("Poster Series");
    expect(results[0]?.score).toBeGreaterThanOrEqual(100);
  });

  it("matches on tags", () => {
    const results = rankDocuments(DOCUMENTS, "print");

    expect(results.map((result) => result.title)).toEqual(["Poster Series"]);
  });

  it("matches a punctuated tag label typed without its punctuation", () => {
    const documents = [doc({ title: "Some Site", tags: ["Next.js"], tagValues: ["next-js"] })];

    expect(rankDocuments(documents, "nextjs").map((result) => result.title)).toEqual(["Some Site"]);
  });

  it("matches the stored tag value as well as its label", () => {
    const documents = [doc({ title: "App", tags: ["PostgreSQL"], tagValues: ["postgres"] })];

    expect(rankDocuments(documents, "postgres")).toHaveLength(1);
  });

  it("scores a whole-tag hit above a tag the token merely appears inside", () => {
    const whole = doc({ title: "A", tags: ["Swift"], tagValues: ["swift"], id: "whole" });
    const partial = doc({ title: "B", tags: ["SwiftUI"], tagValues: ["swiftui"], id: "partial" });

    const results = rankDocuments([partial, whole], "swift");

    expect(results.map((result) => result.id)).toEqual(["whole", "partial"]);
  });

  it("excludes documents that match nothing", () => {
    expect(rankDocuments(DOCUMENTS, "kubernetes")).toEqual([]);
  });

  it("respects the limit", () => {
    expect(rankDocuments(DOCUMENTS, "brutalist", 1)).toHaveLength(1);
  });

  it("breaks score ties on recency, newest first", () => {
    const older = doc({ title: "Same Name", date: "2020-01-01", id: "older" });
    const newer = doc({ title: "Same Name", date: "2026-01-01", id: "newer" });

    const results = rankDocuments([older, newer], "same name");

    expect(results.map((result) => result.id)).toEqual(["newer", "older"]);
  });

  it("breaks remaining ties on title so ordering is stable", () => {
    const beta = doc({ title: "Beta Study", id: "beta" });
    const alpha = doc({ title: "Alpha Study", id: "alpha" });

    const results = rankDocuments([beta, alpha], "study");

    expect(results.map((result) => result.id)).toEqual(["alpha", "beta"]);
  });

  it("rewards a document matching every token of a multi-word query", () => {
    const both = doc({ title: "Risograph Poster", excerpt: "series of prints", id: "both" });
    const one = doc({ title: "Poster Wall", id: "one" });

    const results = rankDocuments([one, both], "risograph poster");

    expect(results[0]?.id).toBe("both");
  });
});

describe("suggestCompletions", () => {
  it("returns nothing for an empty query", () => {
    expect(suggestCompletions(DOCUMENTS, "  ")).toEqual([]);
  });

  it("completes a partial word from titles", () => {
    expect(suggestCompletions(DOCUMENTS, "brut")).toContain("Brutalist Portfolio");
  });

  it("suggests tags as well as titles", () => {
    expect(suggestCompletions(DOCUMENTS, "web")).toContain("Websites");
  });

  it("preserves the authored casing", () => {
    expect(suggestCompletions(DOCUMENTS, "poster")).toEqual(["Poster Series"]);
  });

  it("ranks prefix matches above mid-string matches", () => {
    const documents = [doc({ title: "Series Index" }), doc({ title: "Poster Series" })];

    expect(suggestCompletions(documents, "seri")[0]).toBe("Series Index");
  });

  it("omits a phrase the query already equals", () => {
    expect(suggestCompletions(DOCUMENTS, "archive")).toEqual([]);
  });

  it("dedupes a phrase shared by several documents", () => {
    const documents = [
      doc({ title: "One", tags: ["Projects"], id: "1" }),
      doc({ title: "Two", tags: ["Projects"], id: "2" }),
    ];

    expect(suggestCompletions(documents, "proj")).toEqual(["Projects"]);
  });

  it("respects the limit", () => {
    const documents = [
      doc({ title: "Studio A" }),
      doc({ title: "Studio B" }),
      doc({ title: "Studio C" }),
    ];

    expect(suggestCompletions(documents, "studio", 2)).toHaveLength(2);
  });
});
