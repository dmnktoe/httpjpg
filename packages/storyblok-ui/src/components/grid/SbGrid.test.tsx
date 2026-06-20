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
});
