import { render } from "@testing-library/react";

import { SbGrid } from "./SbGrid";

describe("SbGrid", () => {
  it("returns null without items", () => {
    const { container } = render(<SbGrid blok={{ _uid: "1", component: "grid" } as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a grid with responsive column variables", () => {
    const { container } = render(
      <SbGrid
        blok={
          {
            _uid: "2",
            component: "grid",
            columns: "2",
            columnsMd: "3",
            columnsLg: "4",
            items: [{ _uid: "i1", component: "headline", text: "Hi" }],
          } as never
        }
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("applies Storyblok alignment fields onto the grid", () => {
    const { container } = render(
      <SbGrid
        blok={
          {
            _uid: "4",
            component: "grid",
            columns: "2",
            align: "center",
            justify: "end",
            justifyContent: "space-between",
            flow: "row-dense",
            items: [{ _uid: "i1", component: "headline", text: "Hi" }],
          } as never
        }
      />,
    );

    expect(container.firstElementChild).toHaveStyle({
      alignItems: "center",
      justifyItems: "end",
      justifyContent: "space-between",
      gridAutoFlow: "row dense",
    });
  });

  it("falls back to a single column for auto layouts", () => {
    const { container } = render(
      <SbGrid
        blok={
          {
            _uid: "3",
            component: "grid",
            columns: "auto",
            items: [{ _uid: "i1", component: "headline", text: "Hi" }],
          } as never
        }
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("isolates the grid so a negative item z-index stays above the surface behind it", () => {
    const { container } = render(
      <SbGrid
        blok={
          {
            _uid: "5",
            component: "grid",
            mt: "-4",
            items: [{ _uid: "i1", component: "grid_item", zIndex: "-1" }],
          } as never
        }
      />,
    );
    const grid = container.firstElementChild as HTMLElement;

    expect(grid.className).toContain("jpg-isolation_isolate");
    expect(grid.className).toContain("jpg-mt_var(--sb-mt)");
    expect(grid.style.getPropertyValue("--sb-mt")).toBe("calc(var(--jpg-spacing-4) * -1)");
  });
});
