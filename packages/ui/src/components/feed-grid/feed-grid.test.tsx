import { render, screen } from "@testing-library/react";

import { FeedGrid } from "./feed-grid";

describe("FeedGrid", () => {
  it("lays its children out in a grid", () => {
    render(
      <FeedGrid data-testid="grid">
        <span>one</span>
        <span>two</span>
      </FeedGrid>,
    );

    const grid = screen.getByTestId("grid");
    expect(grid.className).toContain("jpg-d_grid");
    expect(grid.children).toHaveLength(2);
  });

  it("lets the viewport choose the view unless told", () => {
    const { rerender } = render(
      <FeedGrid data-testid="grid">
        <span>one</span>
      </FeedGrid>,
    );
    expect(screen.getByTestId("grid")).toHaveAttribute("data-feed-view", "auto");

    rerender(
      <FeedGrid data-testid="grid" view="list">
        <span>one</span>
      </FeedGrid>,
    );
    expect(screen.getByTestId("grid")).toHaveAttribute("data-feed-view", "list");
  });

  it("merges caller styles", () => {
    render(
      <FeedGrid data-testid="grid" css={{ mt: "4" }}>
        <span>one</span>
      </FeedGrid>,
    );

    expect(screen.getByTestId("grid").className).toContain("jpg-mt_4");
  });
});
