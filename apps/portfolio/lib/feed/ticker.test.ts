// @vitest-environment node
import type { FeedPostEntry } from "../queries/feed";
import { toTickerItems } from "./ticker";

function post(caption?: string): FeedPostEntry {
  return { id: "a", href: "/feed/a", content: { _uid: "a", component: "post", caption } };
}

describe("toTickerItems", () => {
  it("takes the first line of each caption", () => {
    expect(toTickerItems([post("harbour dump\nthree frames"), post("  new mix  ")])).toEqual([
      "harbour dump",
      "new mix",
    ]);
  });

  it("skips posts without a caption", () => {
    expect(toTickerItems([post(), post(""), post("\n\n")])).toEqual([]);
  });

  it("shortens a long line", () => {
    const [item] = toTickerItems([post("a".repeat(80))]);

    expect(item).toHaveLength(60);
    expect(item?.endsWith("…")).toBe(true);
  });

  it("never cuts an emoji in half", () => {
    const [item] = toTickerItems([post(`${"a".repeat(58)}🌊🌊🌊`)]);

    expect(item).toBe(`${"a".repeat(58)}🌊…`);
  });
});
