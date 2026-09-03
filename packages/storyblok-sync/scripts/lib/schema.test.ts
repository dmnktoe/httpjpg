// @vitest-environment node
import { allBlocks } from "./schema";

describe("allBlocks", () => {
  it("concatenates every blok group", () => {
    const blocks = allBlocks();
    const groups = new Set(blocks.map((b) => b.group));
    expect(groups).toEqual(new Set(["Layout", "Content", "Media", "Pages", "Settings"]));
    expect(blocks.some((b) => b.name === "page")).toBe(true);
    expect(blocks.some((b) => b.name === "grid")).toBe(true);
  });
});
