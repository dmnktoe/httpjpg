import type { WorkCardProps } from "../work-card/work-card";
import { collectWorkTags, filterWorksByTag } from "./lib";

function work(slug: string, tags?: string[]): WorkCardProps {
  return { slug, title: slug, images: [], ...(tags ? { tags } : {}) };
}

describe("collectWorkTags", () => {
  it("returns nothing when no work carries a tag", () => {
    expect(collectWorkTags([work("a"), work("b")])).toEqual([]);
  });

  it("orders the most-used tag first", () => {
    const works = [
      work("a", ["React", "Print"]),
      work("b", ["React"]),
      work("c", ["React", "Print"]),
    ];

    expect(collectWorkTags(works)).toEqual(["React", "Print"]);
  });

  it("breaks ties alphabetically so the order is stable across renders", () => {
    const works = [work("a", ["Zine", "Audio"]), work("b", ["Motion"])];

    expect(collectWorkTags(works)).toEqual(["Audio", "Motion", "Zine"]);
  });

  it("counts a tag once per work even when it repeats on one", () => {
    const works = [work("a", ["React", "React"]), work("b", ["Print"])];

    expect(collectWorkTags(works)).toEqual(["Print", "React"]);
  });
});

describe("filterWorksByTag", () => {
  const works = [work("a", ["React"]), work("b", ["Print"]), work("c")];

  it("returns everything when nothing is selected", () => {
    expect(filterWorksByTag(works, null)).toEqual(works);
  });

  it("keeps only the works carrying the tag", () => {
    expect(filterWorksByTag(works, "React").map((item) => item.slug)).toEqual(["a"]);
  });

  it("drops untagged works rather than treating them as matching everything", () => {
    expect(filterWorksByTag(works, "Print").map((item) => item.slug)).toEqual(["b"]);
  });
});
