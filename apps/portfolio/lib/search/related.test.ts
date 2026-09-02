import type { SearchDocument } from "./ranking";
import { relatedDocuments } from "./related";

function doc(
  id: string,
  tagValues: string[],
  overrides: Partial<SearchDocument> = {},
): SearchDocument {
  return {
    id,
    href: `/work/${id}`,
    title: id,
    kind: "work",
    tags: tagValues,
    tagValues,
    excerpt: "",
    ...overrides,
  };
}

describe("relatedDocuments", () => {
  it("returns nothing when the current story has no tags", () => {
    const current = doc("current", []);

    expect(relatedDocuments([current, doc("other", ["ios"])], current)).toEqual([]);
  });

  it("returns nothing when a stale cached document has no tagValues at all", () => {
    const current = { ...doc("current", []), tagValues: undefined };

    expect(relatedDocuments([current, doc("other", ["ios"])], current)).toEqual([]);
  });

  it("excludes the current story from its own neighbours", () => {
    const current = doc("current", ["ios"]);

    const related = relatedDocuments([current, doc("other", ["ios"])], current);

    expect(related.map((item) => item.id)).toEqual(["other"]);
  });

  it("excludes a story that shares no tag", () => {
    const current = doc("current", ["ios"]);

    expect(relatedDocuments([current, doc("other", ["print"])], current)).toEqual([]);
  });

  it("ignores pages, so only work is recommended", () => {
    const current = doc("current", ["ios"]);
    const page = doc("about", ["ios"], { kind: "page" });

    expect(relatedDocuments([current, page], current)).toEqual([]);
  });

  it("ranks a rare shared tag above a ubiquitous one", () => {
    const current = doc("current", ["web", "glsl"]);
    const common = doc("common", ["web"]);
    const rare = doc("rare", ["glsl"]);
    const filler = Array.from({ length: 8 }, (_, index) => doc(`filler-${index}`, ["web"]));

    const related = relatedDocuments([current, common, rare, ...filler], current);

    expect(related[0]?.id).toBe("rare");
  });

  it("ranks more shared tags above fewer, all else equal", () => {
    const current = doc("current", ["ios", "swift"]);
    const one = doc("one", ["ios"]);
    const two = doc("two", ["ios", "swift"]);

    expect(relatedDocuments([current, one, two], current)[0]?.id).toBe("two");
  });

  it("reports the shared tags rarest first", () => {
    const current = doc("current", ["web", "glsl"]);
    const match = doc("match", ["web", "glsl"]);
    const filler = Array.from({ length: 8 }, (_, index) => doc(`filler-${index}`, ["web"]));

    const [related] = relatedDocuments([current, match, ...filler], current);

    expect(related.sharedTags).toEqual(["glsl", "web"]);
  });

  it("breaks a tie on recency, newest first", () => {
    const current = doc("current", ["ios"]);
    const older = doc("older", ["ios"], { date: "2020-01-01" });
    const newer = doc("newer", ["ios"], { date: "2026-01-01" });

    const related = relatedDocuments([current, older, newer], current);

    expect(related.map((item) => item.id)).toEqual(["newer", "older"]);
  });

  it("respects the limit", () => {
    const current = doc("current", ["ios"]);
    const others = Array.from({ length: 5 }, (_, index) => doc(`other-${index}`, ["ios"]));

    expect(relatedDocuments([current, ...others], current, 2)).toHaveLength(2);
  });

  it("breaks a remaining tie alphabetically and skips untagged neighbours", () => {
    const current = doc("current", ["ios"]);
    const alpha = doc("alpha", ["ios"], { date: "2020-01-01" });
    const beta = doc("beta", ["ios"], { date: "2020-01-01" });
    const untagged = { ...doc("ghost", []), tagValues: undefined, href: "/work/current" };

    expect(
      relatedDocuments([current, beta, alpha, untagged], current).map((item) => item.id),
    ).toEqual(["alpha", "beta"]);
  });
});
