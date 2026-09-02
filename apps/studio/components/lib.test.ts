import { describe, expect, it } from "vitest";

import {
  type BuilderItem,
  deserializeGrid,
  duplicateItem,
  emptySpacing,
  type ExportedGrid,
  findGridsInBody,
  GRID_COLS,
  MARGIN_OPTIONS,
  nudgeItem,
  serializeGrid,
  spacingToPx,
} from "./lib";

function item(overrides: Partial<BuilderItem> = {}): BuilderItem {
  return {
    id: "item-a",
    type: "headline",
    x: 0,
    y: 0,
    w: 4,
    h: 2,
    spacing: emptySpacing(),
    data: { text: "Hello", level: "2", align: "" },
    ...overrides,
  };
}

describe("serializeGrid / deserializeGrid", () => {
  it("round-trips spans, md/lg overrides, spacing, hidden and align", () => {
    const settings = { columns: 12, columnsMd: 8, columnsLg: 12, gap: "4" };
    const source = item({
      x: 2,
      y: 3,
      w: 6,
      h: 2,
      xMd: 1,
      yMd: 4,
      wMd: 4,
      hMd: 3,
      xLg: 0,
      yLg: 1,
      wLg: 12,
      hLg: 1,
      hiddenMd: true,
      alignSelf: "center",
      justifySelf: "end",
      spacing: { base: { mt: "4", pr: "2" }, md: { mb: "8" }, lg: {} },
    });

    const exported = serializeGrid(settings, [source]);
    const back = deserializeGrid(exported);

    expect(back.settings).toEqual(settings);
    expect(back.items).toHaveLength(1);
    expect(back.items[0]).toMatchObject({
      type: "headline",
      x: 2,
      y: 3,
      w: 6,
      h: 2,
      xMd: 1,
      yMd: 4,
      wMd: 4,
      hMd: 3,
      xLg: 0,
      yLg: 1,
      wLg: 12,
      hLg: 1,
      hiddenMd: true,
      alignSelf: "center",
      justifySelf: "end",
      spacing: { base: { mt: "4", pr: "2" }, md: { mb: "8" }, lg: {} },
      data: { text: "Hello", level: "2", align: "" },
    });
  });

  it("maps a full span back to GRID_COLS", () => {
    const { items } = deserializeGrid({
      component: "grid",
      _uid: "grid-1",
      columns: "12",
      items: [
        {
          component: "grid_item",
          _uid: "gi-1",
          colStart: 1,
          rowStart: 1,
          colSpan: "full",
          rowSpan: "2",
          content: [{ component: "headline", _uid: "h-1", text: "Wide" }],
        },
      ],
    });

    expect(items[0].w).toBe(GRID_COLS);
    expect(items[0].h).toBe(2);
  });

  it("auto-flows items that have no colStart or rowStart", () => {
    const { items } = deserializeGrid({
      component: "grid",
      _uid: "grid-1",
      columns: "12",
      items: [
        {
          component: "grid_item",
          _uid: "a",
          colSpan: "8",
          rowSpan: "1",
          content: [{ component: "headline", _uid: "h-1", text: "A" }],
        },
        {
          component: "grid_item",
          _uid: "b",
          colSpan: "8",
          rowSpan: "1",
          content: [{ component: "headline", _uid: "h-2", text: "B" }],
        },
      ],
    });

    expect(items[0]).toMatchObject({ x: 0, y: 0, w: 8 });
    expect(items[1]).toMatchObject({ x: 0, y: 1, w: 8 });
  });
});

describe("findGridsInBody", () => {
  it("keeps only grid bloks from a mixed body", () => {
    const grid = { component: "grid", _uid: "g", columns: "12", items: [] } satisfies ExportedGrid;
    expect(findGridsInBody([{ component: "headline" }, grid, { component: "paragraph" }])).toEqual([
      grid,
    ]);
    expect(findGridsInBody(null)).toEqual([]);
  });
});

describe("nudgeItem / duplicateItem", () => {
  it("writes the active viewport instead of always mutating base x/y", () => {
    const source = item({ x: 0, y: 0, xMd: 2, yMd: 3, w: 4 });

    expect(nudgeItem(source, "md", 12, 1, 0)).toMatchObject({ x: 0, y: 0, xMd: 3, yMd: 3 });
    expect(nudgeItem(source, "base", 12, 1, 1)).toMatchObject({ x: 1, y: 1, xMd: 2, yMd: 3 });
  });

  it("clamps against the current viewport width", () => {
    const source = item({ x: 10, w: 4 });
    expect(nudgeItem(source, "base", 12, 4, 0)).toMatchObject({ x: 8, w: 4 });
  });

  it("duplicates onto the active viewport and clones data", () => {
    const source = item({ x: 1, y: 1, xLg: 2, yLg: 4, data: { text: "Hello", level: "2" } });
    const dup = duplicateItem(source, "lg", 12);

    expect(dup.id).not.toBe(source.id);
    expect(dup.data).toEqual(source.data);
    expect(dup.data).not.toBe(source.data);
    expect(dup).toMatchObject({ x: 1, y: 1, xLg: 3, yLg: 5 });
  });
});

describe("spacingToPx", () => {
  it("resolves a positive token to its rem value", () => {
    expect(spacingToPx("4")).toBe("1rem");
  });

  it("negates the rem value for a signed token", () => {
    expect(spacingToPx("-4")).toBe("-1rem");
    expect(spacingToPx("-0")).toBeUndefined();
  });

  it("returns undefined for an unknown key", () => {
    expect(spacingToPx()).toBeUndefined();
    expect(spacingToPx("not-a-token")).toBeUndefined();
  });
});

describe("MARGIN_OPTIONS", () => {
  it("includes signed pull-out values that SPACING_OPTIONS does not", () => {
    expect(MARGIN_OPTIONS.some((option) => option.value === "-4")).toBe(true);
  });
});
