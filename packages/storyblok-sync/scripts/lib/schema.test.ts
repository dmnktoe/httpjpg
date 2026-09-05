// @vitest-environment node
import { allBlocks } from "./schema";

describe("allBlocks", () => {
  it("concatenates every blok group", () => {
    const blocks = allBlocks();
    const groups = new Set(blocks.map((b) => b.group));
    expect(groups).toEqual(new Set(["Layout", "Content", "Media", "Pages", "Settings"]));
    expect(blocks.some((b) => b.name === "page")).toBe(true);
    expect(blocks.some((b) => b.name === "grid")).toBe(true);
    expect(blocks.some((b) => b.name === "floating_item")).toBe(true);
    const work = blocks.find((b) => b.name === "work");
    expect(work?.schema.floating_media).toMatchObject({
      type: "bloks",
      component_whitelist: ["floating_item"],
    });
    const item = blocks.find((b) => b.name === "floating_item");
    expect(item?.schema.width).toMatchObject({
      type: "option",
      default_value: "400",
    });
  });
});
