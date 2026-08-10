import {
  resolveWorkTags,
  WORK_TAG_GROUPS,
  WORK_TAGS,
  workTagByValue,
  workTagDatasourceEntries,
  workTagLabels,
} from "./work-tags";

describe("WORK_TAGS", () => {
  it("has no duplicate values", () => {
    const values = WORK_TAGS.map((tag) => tag.value);

    expect(new Set(values).size).toBe(values.length);
  });

  it("has no duplicate labels", () => {
    const labels = WORK_TAGS.map((tag) => tag.label);

    expect(new Set(labels).size).toBe(labels.length);
  });

  it("only uses declared groups", () => {
    const groups = Object.keys(WORK_TAG_GROUPS);

    for (const tag of WORK_TAGS) {
      expect(groups).toContain(tag.group);
    }
  });

  it("uses url-safe lowercase values", () => {
    for (const tag of WORK_TAGS) {
      expect(tag.value).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});

describe("workTagByValue", () => {
  it("finds a tag", () => {
    expect(workTagByValue("typescript")?.label).toBe("TypeScript");
  });

  it("returns undefined for an unknown value", () => {
    expect(workTagByValue("cobol")).toBeUndefined();
  });
});

describe("resolveWorkTags", () => {
  it("returns nothing for undefined or empty input", () => {
    expect(resolveWorkTags(undefined)).toEqual([]);
    expect(resolveWorkTags([])).toEqual([]);
  });

  it("drops values outside the vocabulary rather than echoing the slug", () => {
    expect(resolveWorkTags(["typescript", "made-up"]).map((tag) => tag.value)).toEqual([
      "typescript",
    ]);
  });

  it("collapses duplicates", () => {
    expect(resolveWorkTags(["ios", "ios"])).toHaveLength(1);
  });

  it("orders by group regardless of the order they were stored in", () => {
    const resolved = resolveWorkTags(["figma", "typescript", "frontend"]);

    expect(resolved.map((tag) => tag.group)).toEqual(["discipline", "language", "tooling"]);
  });
});

describe("workTagLabels", () => {
  it("maps values to display labels", () => {
    expect(workTagLabels(["ios", "swiftui"])).toEqual(["SwiftUI", "iOS"]);
  });
});

describe("workTagDatasourceEntries", () => {
  it("emits one entry per tag, prefixed with its group", () => {
    const entries = workTagDatasourceEntries();

    expect(entries).toHaveLength(WORK_TAGS.length);
    expect(entries).toContainEqual({ name: "Language · TypeScript", value: "typescript" });
  });

  it("keeps entry names unique so the datasource upsert can match on them", () => {
    const names = workTagDatasourceEntries().map((entry) => entry.name);

    expect(new Set(names).size).toBe(names.length);
  });
});
