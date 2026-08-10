import { firstCitedSource } from "./citations";

describe("firstCitedSource", () => {
  it("reads a single citation", () => {
    expect(firstCitedSource("Built with Next.js [2].", 3)).toBe(2);
  });

  it("takes the first of a run of citations", () => {
    expect(firstCitedSource("Two of them [3][1].", 3)).toBe(3);
  });

  it("takes the first of a comma-separated citation", () => {
    expect(firstCitedSource("Both [2, 3] cover it.", 3)).toBe(2);
  });

  it("handles a two-digit index", () => {
    expect(firstCitedSource("See [12].", 12)).toBe(12);
  });

  it("returns null when the answer cites nothing", () => {
    expect(firstCitedSource("I could not find anything about that.", 3)).toBeNull();
  });

  it("returns null for a citation outside the source range", () => {
    expect(firstCitedSource("See [7].", 3)).toBeNull();
  });

  it("returns null when there are no sources at all", () => {
    expect(firstCitedSource("See [1].", 0)).toBeNull();
  });

  it("ignores a bracketed non-number", () => {
    expect(firstCitedSource("An [aside] here.", 3)).toBeNull();
  });
});
