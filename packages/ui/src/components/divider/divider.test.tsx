import { render, screen } from "@testing-library/react";
import { createRef } from "react";

import {
  ASCII_DIVIDER_ARROWS,
  ASCII_DIVIDER_DOTS,
  ASCII_DIVIDER_STARS,
  ASCII_DIVIDER_WAVE,
  ASCII_SPARKLES,
} from "../ascii-art/banners";
import { Divider } from "./divider";

describe("Divider", () => {
  it("renders a horizontal solid rule by default", () => {
    const { container } = render(<Divider data-testid="divider" />);
    const divider = screen.getByTestId("divider");

    expect(container.firstChild).toBe(divider);
    expect(divider).toHaveStyle({ borderTopStyle: "solid", borderTopWidth: "1px" });
  });

  it("forwards its ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Divider ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it.each([
    ["dashed", "dashed"],
    ["dotted", "dotted"],
    ["solid", "solid"],
  ] as const)("renders the %s border style", (variant, expected) => {
    render(<Divider variant={variant} data-testid="divider" />);

    expect(screen.getByTestId("divider")).toHaveStyle({ borderTopStyle: expected });
  });

  it("switches to a left border when vertical", () => {
    render(<Divider orientation="vertical" thickness="3px" data-testid="divider" />);
    const divider = screen.getByTestId("divider");

    expect(divider).toHaveStyle({ borderLeftWidth: "3px", borderLeftStyle: "solid" });
    expect(divider.style.borderTopWidth).toBe("");
  });

  it("honors a custom thickness", () => {
    render(<Divider thickness="4px" data-testid="divider" />);

    expect(screen.getByTestId("divider")).toHaveStyle({ borderTopWidth: "4px" });
  });

  it("renders the default ascii pattern for the ascii variant", () => {
    render(<Divider variant="ascii" />);

    expect(screen.getByText(ASCII_DIVIDER_STARS)).toBeInTheDocument();
  });

  it.each([
    ["stars", ASCII_DIVIDER_STARS],
    ["dots", ASCII_DIVIDER_DOTS],
    ["wave", ASCII_DIVIDER_WAVE],
    ["arrows", ASCII_DIVIDER_ARROWS],
    ["sparkles", ASCII_SPARKLES],
  ] as const)("renders the %s preset", (preset, expected) => {
    render(<Divider variant="ascii" preset={preset} />);

    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("lets an explicit pattern win over the preset", () => {
    render(<Divider variant="ascii" preset="dots" pattern="~~~" />);

    expect(screen.getByText("~~~")).toBeInTheDocument();
    expect(screen.queryByText(ASCII_DIVIDER_DOTS)).not.toBeInTheDocument();
  });

  it("renders children instead of a pattern", () => {
    render(<Divider variant="ascii">or</Divider>);

    expect(screen.getByText("or")).toBeInTheDocument();
  });

  it("switches to the ascii layout as soon as it has children, whatever the variant", () => {
    render(<Divider>middle</Divider>);

    expect(screen.getByText("middle")).toBeInTheDocument();
  });

  it("treats the custom variant like the ascii variant", () => {
    render(<Divider variant="custom" pattern="***" />);

    expect(screen.getByText("***")).toBeInTheDocument();
  });

  it("renders the ascii variant vertically", () => {
    render(<Divider variant="ascii" orientation="vertical" data-testid="divider" />);

    expect(screen.getByTestId("divider")).toBeInTheDocument();
  });

  it("resolves the color token onto the inline style", () => {
    render(<Divider variant="ascii" color="primary.500" data-testid="divider" />);

    expect(screen.getByTestId("divider").style.color).not.toBe("");
  });

  it("passes through arbitrary div props", () => {
    render(<Divider id="rule" aria-label="section break" data-testid="divider" />);

    expect(screen.getByTestId("divider")).toHaveAttribute("id", "rule");
    expect(screen.getByLabelText("section break")).toBeInTheDocument();
  });

  it("accepts a custom spacing value", () => {
    render(<Divider spacing="10" data-testid="divider" />);

    expect(screen.getByTestId("divider")).toBeInTheDocument();
  });
});
