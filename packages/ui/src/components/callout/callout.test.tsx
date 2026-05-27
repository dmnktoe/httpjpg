import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Callout } from "./callout";

describe("Callout", () => {
  it("renders children", () => {
    render(<Callout>Alert message</Callout>);
    expect(screen.getByText("Alert message")).toBeInTheDocument();
  });

  it("renders with role note", () => {
    render(<Callout>Content</Callout>);
    expect(screen.getByRole("note")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<Callout title="Warning">Body text</Callout>);
    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Body text")).toBeInTheDocument();
  });

  it("renders action slot", () => {
    render(<Callout action={<button type="button">Dismiss</button>}>Content</Callout>);
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("renders star borders", () => {
    const { container } = render(<Callout>Content</Callout>);
    const decorations = container.querySelectorAll("[aria-hidden='true']");
    expect(decorations.length).toBeGreaterThanOrEqual(2);
  });

  it("applies tone color styling", () => {
    const { container } = render(<Callout tone="brutalist">Content</Callout>);
    expect(container.firstChild).toBeInTheDocument();
  });
});
