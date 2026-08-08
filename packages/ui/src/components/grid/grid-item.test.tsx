import { render, screen } from "@testing-library/react";
import { createRef } from "react";

import { GridItem } from "./grid-item";

describe("GridItem", () => {
  it("spans a single column and row by default", () => {
    render(<GridItem data-testid="item" />);

    expect(screen.getByTestId("item")).toHaveStyle({ gridColumn: "span 1", gridRow: "span 1" });
  });

  it("forwards its ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<GridItem ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders its children", () => {
    render(<GridItem>content</GridItem>);

    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("spans the given number of columns", () => {
    render(<GridItem colSpan={6} data-testid="item" />);

    expect(screen.getByTestId("item")).toHaveStyle({ gridColumn: "span 6" });
  });

  it("spans the full row for colSpan full", () => {
    render(<GridItem colSpan="full" data-testid="item" />);

    expect(screen.getByTestId("item")).toHaveStyle({ gridColumn: "1 / -1" });
  });

  it("anchors a full-width item that also has an explicit start", () => {
    render(<GridItem colSpan="full" colStart={2} data-testid="item" />);

    expect(screen.getByTestId("item")).toHaveStyle({ gridColumn: "2 / -1" });
  });

  it("combines colStart with the span when no end is given", () => {
    render(<GridItem colStart={3} colSpan={4} data-testid="item" />);

    expect(screen.getByTestId("item")).toHaveStyle({ gridColumn: "3 / span 4" });
  });

  it("lets an explicit colEnd win over the span", () => {
    render(<GridItem colStart={2} colEnd={9} colSpan={4} data-testid="item" />);

    expect(screen.getByTestId("item")).toHaveStyle({ gridColumn: "2 / 9" });
  });

  it("combines rowStart with the row span", () => {
    render(<GridItem rowStart={2} rowSpan={3} data-testid="item" />);

    expect(screen.getByTestId("item")).toHaveStyle({ gridRow: "2 / span 3" });
  });

  it("lets an explicit rowEnd win over the row span", () => {
    render(<GridItem rowStart={2} rowEnd={5} data-testid="item" />);

    expect(screen.getByTestId("item")).toHaveStyle({ gridRow: "2 / 5" });
  });

  it("merges a caller-supplied style without losing the grid placement", () => {
    render(<GridItem colSpan={2} style={{ color: "rgb(0, 0, 255)" }} data-testid="item" />);

    expect(screen.getByTestId("item")).toHaveStyle({
      gridColumn: "span 2",
      color: "rgb(0, 0, 255)",
    });
  });

  it("keeps a caller-supplied className alongside the generated one", () => {
    render(<GridItem className="custom" data-testid="item" />);

    expect(screen.getByTestId("item")).toHaveClass("custom");
  });

  it("applies self-alignment props", () => {
    render(<GridItem alignSelf="center" justifySelf="end" data-testid="item" />);

    expect(screen.getByTestId("item").className).not.toBe("");
  });
});
