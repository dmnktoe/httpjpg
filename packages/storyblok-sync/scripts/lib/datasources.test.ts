// @vitest-environment node
import { WORK_TAG_DATASOURCE_SLUG } from "@httpjpg/storyblok-utils";

import { allDatasources } from "./datasources";

describe("allDatasources", () => {
  it("exports spacing, margin, color, and work-tag datasources", () => {
    const slugs = allDatasources().map((d) => d.datasource.slug);
    expect(slugs).toEqual([
      "spacing-options",
      "margin-options",
      "color-options",
      WORK_TAG_DATASOURCE_SLUG,
    ]);
    for (const ds of allDatasources()) {
      expect(ds.entries.length).toBeGreaterThan(0);
      expect(ds.entries[0]).toMatchObject({ name: expect.any(String), value: expect.any(String) });
    }
  });

  it("sorts signed margins from most negative to most positive", () => {
    const margin = allDatasources().find((d) => d.datasource.slug === "margin-options");
    const values = margin?.entries.map((entry) => Number(entry.value)) ?? [];
    expect(values).toEqual(values.toSorted((a, b) => a - b));
    expect(margin?.entries).toContainEqual({ name: "-4 (-1rem)", value: "-4" });
    expect(margin?.entries.some((entry) => entry.value === "-0")).toBe(false);
  });
});
