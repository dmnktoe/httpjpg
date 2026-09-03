import { render, screen } from "@testing-library/react";

import { Button } from "./button";
import { ButtonGroup } from "./button-group";

describe("ButtonGroup", () => {
  it("renders its buttons inside a group", () => {
    render(
      <ButtonGroup aria-label="Actions">
        <Button>Save</Button>
        <Button variant="secondary">Cancel</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group", { name: "Actions" });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("forwards the ref to the group element", () => {
    let node: HTMLDivElement | null = null;
    render(
      <ButtonGroup
        ref={(element) => {
          node = element;
        }}
      >
        <Button>Only</Button>
      </ButtonGroup>,
    );
    expect(node).toBeInstanceOf(HTMLDivElement);
  });

  it("keeps additional props and class names on the group", () => {
    render(
      <ButtonGroup className="custom" data-testid="group">
        <Button>Only</Button>
      </ButtonGroup>,
    );
    expect(screen.getByTestId("group")).toHaveClass("custom");
  });

  it("can stack, skip wrapping, stretch, and distribute", () => {
    const { rerender } = render(
      <ButtonGroup direction="column" wrap={false} align="start" justify="between" data-testid="g">
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    );
    expect(screen.getByTestId("g")).toBeInTheDocument();

    rerender(
      <ButtonGroup stretch direction="row" data-testid="g">
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    );
    expect(screen.getByTestId("g")).toBeInTheDocument();
  });
});
