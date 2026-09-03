// @vitest-environment node
import { WORK_TAG_DATASOURCE_SLUG } from "@httpjpg/storyblok-utils";

import { allDatasources } from "./datasources";

describe("allDatasources", () => {
  it("exports spacing, color, and work-tag datasources", () => {
    const slugs = allDatasources().map((d) => d.datasource.slug);
    expect(slugs).toEqual(["spacing-options", "color-options", WORK_TAG_DATASOURCE_SLUG]);
    for (const ds of allDatasources()) {
      expect(ds.entries.length).toBeGreaterThan(0);
      expect(ds.entries[0]).toMatchObject({ name: expect.any(String), value: expect.any(String) });
    }
  });
});
