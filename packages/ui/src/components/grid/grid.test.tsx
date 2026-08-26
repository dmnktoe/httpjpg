import { render, screen } from "@testing-library/react";
import { createRef } from "react";

import { Grid } from "./grid";

describe("Grid", () => {
  it("forwards its ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Grid ref={ref}>cell</Grid>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("stretches items on a row flow by default", () => {
    render(<Grid data-testid="grid">cell</Grid>);

    expect(screen.getByTestId("grid")).toHaveStyle({
      alignItems: "stretch",
      justifyItems: "stretch",
      gridAutoFlow: "row",
    });
  });

  it("applies alignment props as CSS grid keywords", () => {
    render(
      <Grid align="center" justify="end" justifyContent="space-between" data-testid="grid">
        cell
      </Grid>,
    );

    expect(screen.getByTestId("grid")).toHaveStyle({
      alignItems: "center",
      justifyItems: "end",
      justifyContent: "space-between",
    });
  });

  it("maps CMS dense flow values onto valid grid-auto-flow", () => {
    const { rerender } = render(
      <Grid flow="row-dense" data-testid="grid">
        cell
      </Grid>,
    );
    expect(screen.getByTestId("grid")).toHaveStyle({ gridAutoFlow: "row dense" });

    rerender(
      <Grid flow="column-dense" data-testid="grid">
        cell
      </Grid>,
    );
    expect(screen.getByTestId("grid")).toHaveStyle({ gridAutoFlow: "column dense" });
  });

  it("treats empty CMS alignment strings as the stretch / row defaults", () => {
    render(
      <Grid
        align={"" as "stretch"}
        justify={"" as "stretch"}
        justifyContent={"" as "center"}
        flow={"" as "row"}
        data-testid="grid"
      >
        cell
      </Grid>,
    );

    expect(screen.getByTestId("grid")).toHaveStyle({
      alignItems: "stretch",
      justifyItems: "stretch",
      gridAutoFlow: "row",
    });
    expect(screen.getByTestId("grid").style.justifyContent).toBe("");
  });

  it("merges a caller-supplied style without losing alignment", () => {
    render(
      <Grid align="end" style={{ color: "rgb(0, 0, 255)" }} data-testid="grid">
        cell
      </Grid>,
    );

    expect(screen.getByTestId("grid")).toHaveStyle({
      alignItems: "end",
      color: "rgb(0, 0, 255)",
    });
  });
});
