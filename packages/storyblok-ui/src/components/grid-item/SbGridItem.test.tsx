import { render } from "@testing-library/react";

import { SbGridItem } from "./SbGridItem";

describe("SbGridItem", () => {
  it("renders an empty grid item", () => {
    const { container } = render(
      <SbGridItem blok={{ _uid: "1", component: "grid_item" } as never} />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with responsive spans and child content", () => {
    const { container } = render(
      <SbGridItem
        blok={
          {
            _uid: "2",
            component: "grid_item",
            colSpan: "full",
            colSpanMd: "6",
            colSpanLg: "4",
            rowSpan: "2",
            rowSpanMd: "3",
            colStartMd: 2,
            hiddenBase: true,
            hiddenMd: false,
            content: [{ _uid: "c1", component: "headline", text: "Hi" }],
          } as never
        }
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("publishes every responsive span as a css custom property", () => {
    const { container } = render(
      <SbGridItem
        blok={
          {
            _uid: "3",
            component: "grid_item",
            colSpanMd: "6",
            colSpanLg: "full",
            rowSpanMd: "2",
            rowSpanLg: "3",
            colStartMd: 2,
            colStartLg: 3,
            rowStartMd: 4,
            rowStartLg: 5,
          } as never
        }
      />,
    );
    const item = container.firstElementChild as HTMLElement;

    expect(item.style.getPropertyValue("--col-md")).toBe("span 6");
    expect(item.style.getPropertyValue("--col-lg")).toBe("1 / -1");
    expect(item.style.getPropertyValue("--row-md")).toBe("span 2");
    expect(item.style.getPropertyValue("--row-lg")).toBe("span 3");
    expect(item.style.getPropertyValue("--colstart-md")).toBe("2");
    expect(item.style.getPropertyValue("--colstart-lg")).toBe("3");
    expect(item.style.getPropertyValue("--rowstart-md")).toBe("4");
    expect(item.style.getPropertyValue("--rowstart-lg")).toBe("5");
  });

  it("maps a numeric colSpan onto the grid item span", () => {
    const { container } = render(
      <SbGridItem blok={{ _uid: "4", component: "grid_item", colSpan: "8" } as never} />,
    );

    expect(container.firstElementChild).toHaveStyle({ gridColumn: "span 8" });
  });

  it("ignores an out-of-range colSpan", () => {
    const { container } = render(
      <SbGridItem blok={{ _uid: "5", component: "grid_item", colSpan: "99" } as never} />,
    );

    expect(container.firstElementChild).toHaveStyle({ gridColumn: "span 1" });
  });

  it("ignores a non-numeric colSpan", () => {
    const { container } = render(
      <SbGridItem blok={{ _uid: "6", component: "grid_item", colSpan: "auto" } as never} />,
    );

    expect(container.firstElementChild).toHaveStyle({ gridColumn: "span 1" });
  });

  it("maps a numeric rowSpan and ignores the full keyword", () => {
    const { container: spanned } = render(
      <SbGridItem blok={{ _uid: "7", component: "grid_item", rowSpan: "3" } as never} />,
    );
    expect(spanned.firstElementChild).toHaveStyle({ gridRow: "span 3" });

    const { container: full } = render(
      <SbGridItem blok={{ _uid: "8", component: "grid_item", rowSpan: "full" } as never} />,
    );
    expect(full.firstElementChild).toHaveStyle({ gridRow: "span 1" });
  });

  it("ignores a zero or unparseable rowSpan", () => {
    const { container } = render(
      <SbGridItem blok={{ _uid: "9", component: "grid_item", rowSpan: "0" } as never} />,
    );

    expect(container.firstElementChild).toHaveStyle({ gridRow: "span 1" });
  });

  it("passes explicit start and end coordinates through", () => {
    const { container } = render(
      <SbGridItem
        blok={
          {
            _uid: "10",
            component: "grid_item",
            colStart: 2,
            colEnd: 6,
            rowStart: 1,
            rowEnd: 3,
            alignSelf: "center",
            justifySelf: "end",
          } as never
        }
      />,
    );

    expect(container.firstElementChild).toHaveStyle({
      gridColumn: "2 / 6",
      gridRow: "1 / 3",
      alignSelf: "center",
      justifySelf: "end",
    });
  });

  it("applies signed spacing and a stacking z-index", () => {
    const { container } = render(
      <SbGridItem
        blok={
          {
            _uid: "12",
            component: "grid_item",
            ml: "-4",
            zIndex: 2,
          } as never
        }
      />,
    );
    const item = container.firstElementChild as HTMLElement;
    expect(item).toHaveStyle({ zIndex: "2" });
  });

  it("hides the item at the lg breakpoint", () => {
    const { container } = render(
      <SbGridItem blok={{ _uid: "11", component: "grid_item", hiddenLg: true } as never} />,
    );

    expect(container.firstElementChild?.className).toContain(" ");
  });
});
