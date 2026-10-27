import { render, screen } from "@testing-library/react";
import { createRef } from "react";

import { GridItem } from "./grid-item";

/** Placement lives in variables that fixed classes read, one per breakpoint. */
function placement(id = "item") {
  const style = screen.getByTestId(id).style;
  const read = (name: string) => style.getPropertyValue(name);
  return {
    col: [read("--item-col"), read("--item-col-md"), read("--item-col-lg")],
    row: [read("--item-row"), read("--item-row-md"), read("--item-row-lg")],
  };
}

describe("GridItem", () => {
  it("auto-places a single cell by default", () => {
    render(<GridItem data-testid="item" />);

    expect(placement()).toEqual({ col: ["auto", "auto", "auto"], row: ["auto", "auto", "auto"] });
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

  it("reads its placement through fixed classes", () => {
    render(<GridItem data-testid="item" />);

    expect(screen.getByTestId("item").className).toContain("jpg-grid-c_var(--item-col)");
  });

  it("spans the given number of columns", () => {
    render(<GridItem colSpan={6} data-testid="item" />);

    expect(placement().col[0]).toBe("span 6");
  });

  it("spans the full row for colSpan full, from an explicit start if given", () => {
    render(<GridItem colSpan="full" data-testid="a" />);
    render(<GridItem colSpan="full" colStart={2} data-testid="b" />);

    expect(placement("a").col[0]).toBe("1 / -1");
    expect(placement("b").col[0]).toBe("2 / -1");
  });

  it("combines a start with the span, and lets an explicit end win", () => {
    render(<GridItem colStart={3} colSpan={4} data-testid="a" />);
    render(<GridItem colStart={2} colEnd={9} colSpan={4} data-testid="b" />);

    expect(placement("a").col[0]).toBe("3 / span 4");
    expect(placement("b").col[0]).toBe("2 / 9");
  });

  it("places rows the same way", () => {
    render(<GridItem rowStart={2} rowSpan={3} data-testid="a" />);
    render(<GridItem rowStart={2} rowEnd={5} data-testid="b" />);

    expect(placement("a").row[0]).toBe("2 / span 3");
    expect(placement("b").row[0]).toBe("2 / 5");
  });

  it("carries the base placement up when no breakpoint overrides it", () => {
    render(<GridItem colStart={2} colSpan={4} data-testid="item" />);

    expect(placement().col).toEqual(["2 / span 4", "2 / span 4", "2 / span 4"]);
  });

  it("keeps a smaller breakpoint's start when a larger one only changes the span", () => {
    render(
      <GridItem
        colSpan="full"
        md={{ colStart: 3, colSpan: 4 }}
        lg={{ colSpan: 6 }}
        data-testid="item"
      />,
    );

    expect(placement().col).toEqual(["1 / -1", "3 / span 4", "3 / span 6"]);
  });

  it("keeps the width when a larger breakpoint only moves the start", () => {
    render(<GridItem colStart={1} colEnd={4} md={{ colStart: 6 }} data-testid="item" />);

    expect(placement().col).toEqual(["1 / 4", "6 / span 3", "6 / span 3"]);
  });

  it("places rows per breakpoint too", () => {
    render(<GridItem lg={{ rowStart: 1, rowSpan: 2 }} data-testid="item" />);

    expect(placement().row).toEqual(["auto", "auto", "1 / span 2"]);
  });

  it("merges a caller-supplied style without losing the placement", () => {
    render(<GridItem colSpan={2} style={{ color: "rgb(0, 0, 255)" }} data-testid="item" />);

    expect(placement().col[0]).toBe("span 2");
    expect(screen.getByTestId("item")).toHaveStyle({ color: "rgb(0, 0, 255)" });
  });

  it("keeps a caller-supplied className alongside the generated one", () => {
    render(<GridItem className="custom" data-testid="item" />);

    expect(screen.getByTestId("item")).toHaveClass("custom");
  });

  it("applies self-alignment props", () => {
    render(<GridItem alignSelf="center" justifySelf="end" data-testid="item" />);

    expect(screen.getByTestId("item")).toHaveStyle({
      alignSelf: "center",
      justifySelf: "end",
    });
  });

  it("ignores empty CMS self-alignment strings", () => {
    render(<GridItem alignSelf={"" as "center"} justifySelf={"" as "end"} data-testid="item" />);

    expect(screen.getByTestId("item").style.alignSelf).toBe("");
    expect(screen.getByTestId("item").style.justifySelf).toBe("");
  });
});
