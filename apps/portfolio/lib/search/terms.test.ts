import { isWithinOneEdit, singular, termVariants } from "./terms";

describe("singular", () => {
  it("strips English and German plural endings", () => {
    expect(singular("apps")).toBe("app");
    expect(singular("fotos")).toBe("foto");
    expect(singular("arbeiten")).toBe("arbeit");
    expect(singular("projekte")).toBe("projekt");
  });

  it("leaves words that only look plural", () => {
    expect(singular("glass")).toBeNull();
    expect(singular("campus")).toBeNull();
    expect(singular("analysis")).toBeNull();
    expect(singular("go")).toBeNull();
    expect(singular("kunde")).toBeNull();
    expect(singular("screen")).toBeNull();
  });
});

describe("termVariants", () => {
  it("adds synonyms in both languages", () => {
    expect(termVariants("projekt")).toEqual(["projekt", "project"]);
    expect(termVariants("photo")).toEqual(
      expect.arrayContaining(["photo", "foto", "photography", "fotografie"]),
    );
  });

  it("adds the synonyms of the singular stem", () => {
    expect(termVariants("projekte")).toEqual(["projekte", "projekt", "project"]);
  });

  it("returns the token alone when it has no variants", () => {
    expect(termVariants("kassel")).toEqual(["kassel"]);
  });
});

describe("isWithinOneEdit", () => {
  it("accepts one substitution, insertion, deletion, or swap", () => {
    expect(isWithinOneEdit("healform", "healform")).toBe(true);
    expect(isWithinOneEdit("healfarm", "healform")).toBe(true);
    expect(isWithinOneEdit("inenstadt", "innenstadt")).toBe(true);
    expect(isWithinOneEdit("innenstaddt", "innenstadt")).toBe(true);
    expect(isWithinOneEdit("innenstdat", "innenstadt")).toBe(true);
  });

  it("rejects two edits or a length gap of two", () => {
    expect(isWithinOneEdit("healfrom", "healform")).toBe(true);
    expect(isWithinOneEdit("hellfarm", "healform")).toBe(false);
    expect(isWithinOneEdit("innenst", "innenstadt")).toBe(false);
    expect(isWithinOneEdit("abcd", "badc")).toBe(false);
  });
});
