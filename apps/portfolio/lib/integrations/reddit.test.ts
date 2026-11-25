import { isRedditUsername, readRedditKarma } from "./reddit";

describe("readRedditKarma", () => {
  it("builds the line from the config story's fields", () => {
    expect(readRedditKarma("dmnktoe", 12345)).toEqual({
      username: "dmnktoe",
      karma: 12345,
      url: "https://www.reddit.com/user/dmnktoe/",
    });
  });

  it("reads a karma Storyblok sends as a string and drops fractions", () => {
    expect(readRedditKarma("dmnktoe", "812")?.karma).toBe(812);
    expect(readRedditKarma("dmnktoe", 12.7)?.karma).toBe(12);
  });

  it("returns null without a valid username or a number", () => {
    expect(readRedditKarma(undefined, 1)).toBeNull();
    expect(readRedditKarma("u/dmnktoe", 1)).toBeNull();
    expect(readRedditKarma("dmnktoe", undefined)).toBeNull();
    expect(readRedditKarma("dmnktoe", "")).toBeNull();
    expect(readRedditKarma("dmnktoe", "lots")).toBeNull();
  });
});

describe("isRedditUsername", () => {
  it("accepts Reddit's username characters only", () => {
    expect(isRedditUsername("dmnktoe")).toBe(true);
    expect(isRedditUsername("a-b_c")).toBe(true);
    expect(isRedditUsername("ab")).toBe(false);
    expect(isRedditUsername("a".repeat(21))).toBe(false);
    expect(isRedditUsername("../x")).toBe(false);
  });
});
