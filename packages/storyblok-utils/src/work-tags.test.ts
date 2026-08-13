import {
  resolveWorkTags,
  WORK_TAG_DATASOURCE_SLUG,
  WORK_TAG_GROUPS,
  WORK_TAGS,
  workTagByValue,
  workTagDatasourceEntries,
  workTagLabels,
} from "./work-tags";

describe("WORK_TAGS", () => {
  it("has a unique value for every entry", () => {
    const values = WORK_TAGS.map((tag) => tag.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("has a unique label for every entry", () => {
    const labels = WORK_TAGS.map((tag) => tag.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("stores values as lowercase slugs so they survive a URL", () => {
    for (const tag of WORK_TAGS) {
      expect(tag.value).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("puts every entry in a known group", () => {
    for (const tag of WORK_TAGS) {
      expect(WORK_TAG_GROUPS[tag.group]).toBeDefined();
    }
  });
});

describe("workTagByValue", () => {
  it("finds a tag by its stored value", () => {
    expect(workTagByValue("typescript")).toEqual({
      value: "typescript",
      label: "TypeScript",
      group: "language",
    });
  });

  it("returns undefined for a value outside the vocabulary", () => {
    expect(workTagByValue("cobol")).toBeUndefined();
  });
});

describe("resolveWorkTags", () => {
  it("returns nothing for empty input", () => {
    expect(resolveWorkTags(undefined)).toEqual([]);
    expect(resolveWorkTags([])).toEqual([]);
  });

  it("drops values outside the vocabulary rather than rendering a raw slug", () => {
    expect(workTagLabels(["typescript", "cobol", "react"])).toEqual(["TypeScript", "React"]);
  });

  it("deduplicates repeated values", () => {
    expect(workTagLabels(["react", "react"])).toEqual(["React"]);
  });

  it("orders by group first, then by catalog position, not by input order", () => {
    expect(workTagLabels(["vercel", "typescript", "frontend", "react"])).toEqual([
      "Frontend",
      "TypeScript",
      "React",
      "Vercel",
    ]);
  });

  it("keeps the authored casing on the label", () => {
    expect(workTagLabels(["ios", "macos", "next-js"])).toEqual(["Next.js", "iOS", "macOS"]);
  });
});

describe("workTagDatasourceEntries", () => {
  it("prefixes each entry with its group so the Storyblok picker stays browsable", () => {
    const entries = workTagDatasourceEntries();

    expect(entries).toHaveLength(WORK_TAGS.length);
    expect(entries).toContainEqual({ name: "Language · TypeScript", value: "typescript" });
    expect(entries).toContainEqual({ name: "Kind · Open Source", value: "open-source" });
  });

  it("targets the work-tags datasource", () => {
    expect(WORK_TAG_DATASOURCE_SLUG).toBe("work-tags");
  });
});
