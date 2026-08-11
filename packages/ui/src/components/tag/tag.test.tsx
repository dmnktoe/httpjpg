import { fireEvent, render, screen } from "@testing-library/react";

import { Tag } from "./tag";
import { TagButton } from "./tag-button";

describe("Tag", () => {
  it("renders its label", () => {
    render(<Tag>TypeScript</Tag>);

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("hides the hash marker from assistive tech", () => {
    const { container } = render(<Tag>TypeScript</Tag>);

    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent("#");
    expect(container).toHaveTextContent("#TypeScript");
  });

  it("drops the marker when asked", () => {
    const { container } = render(<Tag showMarker={false}>TypeScript</Tag>);

    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("is not a button", () => {
    render(<Tag>TypeScript</Tag>);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("TagButton", () => {
  it("renders a button that reports its pressed state", () => {
    render(<TagButton>Print</TagButton>);

    expect(screen.getByRole("button", { name: /Print/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("reports itself pressed when active", () => {
    render(<TagButton isActive>Print</TagButton>);

    expect(screen.getByRole("button", { name: /Print/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("calls back on click", () => {
    const onClick = vi.fn();
    render(<TagButton onClick={onClick}>Print</TagButton>);

    fireEvent.click(screen.getByRole("button", { name: /Print/ }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("defaults to type=button so it never submits a form", () => {
    render(<TagButton>Print</TagButton>);

    expect(screen.getByRole("button", { name: /Print/ })).toHaveAttribute("type", "button");
  });
});
