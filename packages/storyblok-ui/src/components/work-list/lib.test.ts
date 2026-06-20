import { parseCols, resolveStories, toWorkCardProps, type WorkStory } from "./lib";

describe("parseCols", () => {
  it("returns undefined for empty input", () => {
    expect(parseCols(undefined)).toBeUndefined();
    expect(parseCols("")).toBeUndefined();
  });

  it("parses a positive integer", () => {
    expect(parseCols("3")).toBe(3);
  });

  it("rejects zero and non-numeric values", () => {
    expect(parseCols("0")).toBeUndefined();
    expect(parseCols("abc")).toBeUndefined();
  });
});

describe("toWorkCardProps", () => {
  it("falls back to the story name when no title is set", () => {
    const story: WorkStory = { name: "Fallback", slug: "s", full_slug: "work/s" };
    const props = toWorkCardProps(story);
    expect(props.title).toBe("Fallback");
    expect(props.baseUrl).toBe("/work");
    expect(props.images).toEqual([]);
  });

  it("uses the content title and strips taxonomy tags", () => {
    const story: WorkStory = {
      name: "Name",
      slug: "s",
      full_slug: "work/s",
      tag_list: ["Projects", "Cool"],
      content: { title: "Real Title", date: "2024-01-01" },
    };
    const props = toWorkCardProps(story);
    expect(props.title).toBe("Real Title");
    expect(props.tags).toEqual(["Cool"]);
    expect(props.date).toBe("2024-01-01");
  });

  it("returns undefined tags when only taxonomy tags remain", () => {
    const story: WorkStory = {
      name: "Name",
      slug: "s",
      full_slug: "work/s",
      tag_list: ["Projects", "Websites"],
    };
    expect(toWorkCardProps(story).tags).toBeUndefined();
  });
});

describe("resolveStories", () => {
  it("returns an empty array when there are no items", () => {
    expect(resolveStories(undefined, new Map())).toEqual([]);
  });

  it("caches objects by uuid and rehydrates string references", () => {
    const cache = new Map<string, WorkStory>();
    const story: WorkStory = { uuid: "u1", name: "A", slug: "a", full_slug: "work/a" };
    const first = resolveStories([story], cache);
    expect(first).toEqual([story]);

    const second = resolveStories(["u1"], cache);
    expect(second).toEqual([story]);
  });

  it("drops string references that are not in the cache", () => {
    expect(resolveStories(["missing"], new Map())).toEqual([]);
  });
});
