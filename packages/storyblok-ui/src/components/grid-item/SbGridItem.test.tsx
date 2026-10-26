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

  it("maps a numeric rowSpan and ignores the full keyword and zero", () => {
    expect(renderItem({ rowSpan: "3" }).row[0]).toBe("span 3");
    expect(renderItem({ rowSpan: "full" }).row[0]).toBe("auto");
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

  it("hides the item per breakpoint", () => {
    const { item } = renderItem({ hiddenLg: true });

    expect(item.className).toContain("lg:jpg-d_none");
  });
});
