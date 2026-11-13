import { render } from "@testing-library/react";

import { SbGridItem } from "./SbGridItem";

function renderItem(fields: Record<string, unknown>) {
  const { container } = render(
    <SbGridItem blok={{ _uid: "u", component: "grid_item", ...fields } as never} />,
  );
  const item = container.firstElementChild as HTMLElement;
  const read = (name: string) => item.style.getPropertyValue(name);
  return {
    item,
    col: [read("--item-col"), read("--item-col-md"), read("--item-col-lg")],
    row: [read("--item-row"), read("--item-row-md"), read("--item-row-lg")],
  };
}

describe("SbGridItem", () => {
  it("renders an empty grid item", () => {
    expect(renderItem({}).item).not.toBeNull();
  });

  it("renders child content", () => {
    const { item } = renderItem({ content: [{ _uid: "c1", component: "headline", text: "Hi" }] });

    expect(item).not.toBeNull();
  });

  it("places each breakpoint from the CMS fields", () => {
    const { col, row } = renderItem({
      colSpan: "full",
      colSpanMd: "6",
      colStartMd: 2,
      colSpanLg: "7",
      rowSpanLg: "2",
      rowStartLg: 1,
    });

    expect(col).toEqual(["1 / -1", "2 / span 6", "2 / span 7"]);
    expect(row).toEqual(["auto", "auto", "1 / span 2"]);
  });

  it("keeps the tablet start when desktop only sets a span", () => {
    const { col } = renderItem({ colStartMd: 3, colSpanMd: "4", colSpanLg: "6" });

    expect(col).toEqual(["auto", "3 / span 4", "3 / span 6"]);
  });

  it("keeps the base width when tablet only moves the start", () => {
    const { col } = renderItem({ colStart: 1, colEnd: 4, colStartMd: 6 });

    expect(col).toEqual(["1 / 4", "6 / span 3", "6 / span 3"]);
  });

  it("ignores out-of-range, non-numeric and empty spans", () => {
    expect(renderItem({ colSpan: "99" }).col[0]).toBe("auto");
    expect(renderItem({ colSpan: "auto" }).col[0]).toBe("auto");
    expect(renderItem({ colSpanMd: "" }).col[1]).toBe("auto");
  });

  it("accepts negative grid lines but only positive spans", () => {
    expect(renderItem({ colStart: 1, colEnd: -1 }).col[0]).toBe("1 / -1");
    expect(renderItem({ colSpan: "-2" }).col[0]).toBe("auto");
  });

  it("maps a numeric rowSpan, stretches full across every row and ignores zero", () => {
    expect(renderItem({ rowSpan: "3" }).row[0]).toBe("span 3");
    expect(renderItem({ rowSpan: "full" }).row[0]).toBe("1 / -1");
    expect(renderItem({ rowSpan: "2", rowSpanMd: "full" }).row).toEqual([
      "span 2",
      "1 / -1",
      "1 / -1",
    ]);
    expect(renderItem({ rowSpan: "0" }).row[0]).toBe("auto");
  });

  it("passes explicit start and end coordinates and self-alignment through", () => {
    const { item, col, row } = renderItem({
      colStart: 2,
      colEnd: 6,
      rowStart: 1,
      rowEnd: 3,
      alignSelf: "center",
      justifySelf: "end",
    });

    expect(col[0]).toBe("2 / 6");
    expect(row[0]).toBe("1 / 3");
    expect(item).toHaveStyle({ alignSelf: "center", justifySelf: "end" });
  });

  it("applies signed spacing and a stacking z-index", () => {
    const { item } = renderItem({ ml: "-4", zIndex: 2 });

    expect(item).toHaveStyle({ zIndex: "2" });
    expect(item.className).toContain("jpg-ml_var(--sb-ml)");
    expect(item.style.getPropertyValue("--sb-ml")).toBe("calc(var(--jpg-spacing-4) * -1)");
  });

  it.each([
    ["2", "2"],
    ["-1", "-1"],
    [0, "0"],
    ["0", "0"],
  ])("reads the z-index %j as Storyblok sends it", (zIndex, expected) => {
    expect(renderItem({ zIndex }).item.style.zIndex).toBe(expected);
  });

  it.each([
    "",
    " ",
    null,
    undefined,
    false,
    true,
    [],
    "abc",
    "1.5",
    1.5,
    "1e3",
    Number.NaN,
    Infinity,
  ])("sets no z-index, so no stacking context, for %j", (zIndex) => {
    expect(renderItem({ zIndex }).item.style.zIndex).toBe("");
  });

  it("pulls the cell out per breakpoint with negative margins", () => {
    const { item } = renderItem({ mt: "-8", mlMd: "-4", mrLg: "-24" });

    expect(item.className).toContain("jpg-mt_var(--sb-mt)");
    expect(item.className).toContain("md:jpg-ml_var(--sb-ml-md)");
    expect(item.className).toContain("lg:jpg-mr_var(--sb-mr-lg)");
    expect(item.style.getPropertyValue("--sb-mt")).toBe("calc(var(--jpg-spacing-8) * -1)");
    expect(item.style.getPropertyValue("--sb-ml-md")).toBe("calc(var(--jpg-spacing-4) * -1)");
    expect(item.style.getPropertyValue("--sb-mr-lg")).toBe("calc(var(--jpg-spacing-24) * -1)");
  });

  it("hides the item per breakpoint", () => {
    const { item } = renderItem({ hiddenLg: true });

    expect(item.className).toContain("lg:jpg-d_none");
  });
});
