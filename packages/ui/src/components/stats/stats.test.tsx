import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Stats } from "./stats";

const ITEMS = [
  { id: "a", value: "47", label: "Projects" },
  { id: "b", value: "12", label: "Clients", caption: "Since 2020" },
  { id: "c", value: "99", label: "Commits" },
];

describe("Stats", () => {
  it("renders all stat values", () => {
    render(<Stats items={ITEMS} />);
    expect(screen.getByText("47")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("99")).toBeInTheDocument();
  });

  it("renders labels", () => {
    render(<Stats items={ITEMS} />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Clients")).toBeInTheDocument();
  });

  it("renders caption when provided", () => {
    render(<Stats items={ITEMS} />);
    expect(screen.getByText("Since 2020")).toBeInTheDocument();
  });

  it("renders brutalist index labels", () => {
    const { container } = render(<Stats items={ITEMS} variant="brutalist" />);
    const indices = container.querySelectorAll("[aria-hidden='true']");
    expect(indices.length).toBeGreaterThanOrEqual(3);
  });

  it("renders without items gracefully", () => {
    const { container } = render(<Stats items={[]} />);
    expect(container.firstChild?.childNodes.length).toBe(0);
  });
});
