import { describe, expect, it } from "vitest";

import {
  type BuilderItem,
  clamp,
  createItemId,
  deserializeGrid,
  duplicateItem,
  effectiveColumns,
  effectiveH,
  effectiveHidden,
  effectiveSpacing,
  effectiveW,
  effectiveX,
  effectiveY,
  emptySpacing,
  type ExportedGrid,
  findGridsInBody,
  GRID_COLS,
  hiddenFieldForViewport,
  nudgeItem,
  patchPosition,
  patchSize,
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

describe("spacing / effective geometry", () => {
  it("maps known spacing keys and ignores blanks", () => {
    expect(spacingToPx()).toBeUndefined();
    expect(spacingToPx("")).toBeUndefined();
    expect(spacingToPx("4")).toBe("1rem");
    expect(spacingToPx("not-a-token")).toBeUndefined();
  });

  it("cascades spacing, columns, and box geometry across viewports", () => {
    const source = item({
      w: 4,
      h: 2,
      wMd: 6,
      hMd: 3,
      wLg: 12,
      hLg: 1,
      x: 0,
      y: 1,
      xMd: 2,
      yMd: 3,
      xLg: 4,
      yLg: 5,
      hiddenBase: true,
      hiddenMd: false,
      hiddenLg: true,
      spacing: { base: { mt: "2" }, md: { mb: "4" }, lg: { pt: "8" } },
    });

    expect(effectiveSpacing(source, "base")).toEqual({ mt: "2" });
    expect(effectiveSpacing(source, "md")).toEqual({ mt: "2", mb: "4" });
    expect(effectiveSpacing(source, "lg")).toEqual({ mt: "2", mb: "4", pt: "8" });

    expect(effectiveW(source, "base")).toBe(4);
    expect(effectiveW(source, "md")).toBe(6);
    expect(effectiveW(source, "lg")).toBe(12);
    expect(effectiveH(source, "base")).toBe(2);
    expect(effectiveH(source, "md")).toBe(3);
    expect(effectiveH(source, "lg")).toBe(1);
    expect(effectiveX(source, "base")).toBe(0);
    expect(effectiveX(source, "md")).toBe(2);
    expect(effectiveX(source, "lg")).toBe(4);
    expect(effectiveY(source, "base")).toBe(1);
    expect(effectiveY(source, "md")).toBe(3);
    expect(effectiveY(source, "lg")).toBe(5);

    expect(effectiveHidden(source, "base")).toBe(true);
    expect(effectiveHidden(source, "md")).toBe(false);
    expect(effectiveHidden(source, "lg")).toBe(true);
    expect(hiddenFieldForViewport("base")).toBe("hiddenBase");
    expect(hiddenFieldForViewport("md")).toBe("hiddenMd");
    expect(hiddenFieldForViewport("lg")).toBe("hiddenLg");
  });

  it("falls columns back through lg → md → base", () => {
    expect(effectiveColumns({ columns: 4, gap: "4" }, "base")).toBe(4);
    expect(effectiveColumns({ columns: 4, columnsMd: 8, gap: "4" }, "md")).toBe(8);
    expect(effectiveColumns({ columns: 4, columnsMd: 8, gap: "4" }, "lg")).toBe(8);
    expect(effectiveColumns({ columns: 4, columnsMd: 8, columnsLg: 12, gap: "4" }, "lg")).toBe(12);
    expect(effectiveColumns({ columns: 4, gap: "4" }, "md")).toBe(4);
  });

  it("patches size and position onto the active viewport", () => {
    expect(patchSize("base", 3, 2)).toEqual({ w: 3, h: 2 });
    expect(patchSize("md", 3, 2)).toEqual({ wMd: 3, hMd: 2 });
    expect(patchSize("lg", 3, 2)).toEqual({ wLg: 3, hLg: 2 });
    expect(patchPosition("base", 1, 4)).toEqual({ x: 1, y: 4 });
    expect(patchPosition("md", 1, 4)).toEqual({ xMd: 1, yMd: 4 });
    expect(patchPosition("lg", 1, 4)).toEqual({ xLg: 1, yLg: 4 });
  });

  it("clamps and mints ids", () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(2, 0, 3)).toBe(2);
    expect(createItemId()).toMatch(/^item-/);
  });
});

describe("serializeGrid edge cases", () => {
  it("omits empty gap and unknown plugins pass data through", () => {
    const exported = serializeGrid({ columns: 12, gap: "" }, [
      item({ type: "unknown_blok", data: { custom: true } }),
    ]);
    expect(exported.gap).toBeUndefined();
    expect(exported.items[0].content[0]).toMatchObject({
      component: "unknown_blok",
      custom: true,
    });
  });

  it("copies md/lg columns from base when they are omitted", () => {
    const exported = serializeGrid({ columns: 8, gap: "4" }, [item()]);
    expect(exported.columns).toBe("8");
    expect(exported.columnsMd).toBe("8");
    expect(exported.columnsLg).toBe("8");
  });
});

describe("deserializeGrid edge cases", () => {
  it("parses full / empty / invalid spans and optional md/lg overrides", () => {
    const { items, settings } = deserializeGrid({
      component: "grid",
      _uid: "g",
      columns: "not-a-number",
      columnsMd: "full",
      columnsLg: "",
      gap: undefined,
      items: [
        {
          component: "grid_item",
          _uid: "gi",
          colSpan: "",
          rowSpan: "full",
          colSpanMd: "full",
          colSpanLg: "0",
          rowSpanMd: "abc",
          rowSpanLg: "3",
          colStart: 0,
          rowStart: "",
          hiddenBase: true,
          content: [],
        },
      ],
    } as unknown as ExportedGrid);

    expect(settings.columns).toBe(GRID_COLS);
    expect(settings.columnsMd).toBe(GRID_COLS);
    expect(settings.gap).toBe("");
    expect(items[0].h).toBe(GRID_COLS);
    expect(items[0].wMd).toBe(GRID_COLS);
    expect(items[0].wLg).toBeUndefined();
    expect(items[0].hLg).toBe(3);
    expect(items[0].hiddenBase).toBe(true);
    expect(items[0].type).toBe("missing");
  });

  it("auto-flows items that wrap onto the next row", () => {
    const { items } = deserializeGrid({
      component: "grid",
      _uid: "g",
      columns: "12",
      items: [
        {
          component: "grid_item",
          _uid: "a",
          colSpan: "8",
          rowSpan: "2",
          content: [{ component: "headline", _uid: "h1", text: "A" }],
        },
        {
          component: "grid_item",
          _uid: "b",
          colSpan: "8",
          rowSpan: "1",
          alignSelf: "center",
          justifySelf: "end",
          content: [{ component: "headline", _uid: "h2", text: "B" }],
        },
      ],
    });
    expect(items[0].x).toBe(0);
    expect(items[0].y).toBe(0);
    expect(items[1].x).toBe(0);
    expect(items[1].y).toBe(2);
    expect(items[1].alignSelf).toBe("center");
  });

  it("falls back when crypto.randomUUID is missing", () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, "crypto", { configurable: true, value: {} });
    try {
      const exported = serializeGrid({ columns: 12, gap: "4" }, [item()]);
      expect(exported._uid).toBeTruthy();
    } finally {
      Object.defineProperty(globalThis, "crypto", { configurable: true, value: original });
    }
  });
});
