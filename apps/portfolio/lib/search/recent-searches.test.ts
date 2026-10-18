import { clearRecentSearches, readRecentSearches, rememberSearch } from "./recent-searches";

describe("recent searches", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty", () => {
    expect(readRecentSearches()).toEqual([]);
  });

  it("keeps the newest first and moves a repeat to the front", () => {
    rememberSearch("poster");
    rememberSearch("blence");
    rememberSearch("  Poster ");
    expect(readRecentSearches()).toEqual(["Poster", "blence"]);
  });

  it("ignores blank queries", () => {
    rememberSearch("poster");
    rememberSearch("   ");
    expect(readRecentSearches()).toEqual(["poster"]);
  });

  it("keeps at most six", () => {
    for (const query of ["a1", "a2", "a3", "a4", "a5", "a6", "a7"]) {
      rememberSearch(query);
    }
    expect(readRecentSearches()).toEqual(["a7", "a6", "a5", "a4", "a3", "a2"]);
  });

  it("survives a corrupt store", () => {
    window.localStorage.setItem("httpjpg.recent-searches", "{not json");
    expect(readRecentSearches()).toEqual([]);
  });

  it("hands back the same array while the store is unchanged", () => {
    rememberSearch("poster");
    expect(readRecentSearches()).toBe(readRecentSearches());
  });

  it("clears", () => {
    rememberSearch("poster");
    clearRecentSearches();
    expect(readRecentSearches()).toEqual([]);
  });
});
