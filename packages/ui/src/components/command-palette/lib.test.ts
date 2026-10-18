import { citedSourceNumbers, highlightRanges, snippetAround, splitCitations } from "./lib";

function marked(text: string, terms: string[]): string[] {
  return highlightRanges(text, terms).map((range) => text.slice(range.start, range.end));
}

describe("highlightRanges", () => {
  it("marks terms only where they start a word", () => {
    expect(marked("what happened to the app, an application", ["app"])).toEqual(["app"]);
    expect(marked("an application", ["appl"])).toEqual(["appl"]);
  });

  it("keeps short terms to whole words, like the ranking", () => {
    expect(marked("ID-100 and 1,100+ commits, idea", ["id", "100"])).toEqual(["ID", "100", "100"]);
  });

  it("matches across case and diacritics and maps back to the original text", () => {
    expect(marked("Dücker Medizintechnik", ["ducker"])).toEqual(["Dücker"]);
  });

  it("merges overlapping terms", () => {
    expect(highlightRanges("companion", ["comp", "companion"])).toEqual([{ start: 0, end: 9 }]);
  });

  it("returns nothing without terms", () => {
    expect(highlightRanges("anything", [])).toEqual([]);
  });
});

describe("snippetAround", () => {
  it("starts near the first match on a word boundary", () => {
    const text = "An audiovisual manifesto that serves as a thesis on dermatillomania, framing it.";

    expect(snippetAround(text, ["dermatillomania"], 12)).toBe(
      "…thesis on dermatillomania, framing it.",
    );
  });

  it("leaves an early match alone and collapses whitespace", () => {
    expect(snippetAround("Blence  network\nincorporated", ["network"])).toBe(
      "Blence network incorporated",
    );
  });
});

describe("citedSourceNumbers", () => {
  it("collects single and grouped citations within range", () => {
    expect(citedSourceNumbers("A [3]. B [1, 3]. C [9].", 5)).toEqual([1, 3]);
  });

  it("is empty for an uncited answer", () => {
    expect(citedSourceNumbers("No citations.", 5)).toEqual([]);
  });
});

describe("splitCitations", () => {
  it("separates citations from prose", () => {
    expect(splitCitations("It is [1, 2].")).toEqual([
      { text: "It is ", isCitation: false },
      { text: "[1, 2]", isCitation: true },
      { text: ".", isCitation: false },
    ]);
  });
});
