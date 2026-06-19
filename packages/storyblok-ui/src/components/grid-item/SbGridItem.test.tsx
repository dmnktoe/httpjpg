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
});
