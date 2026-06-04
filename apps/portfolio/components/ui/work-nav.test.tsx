import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WorkNav } from "./work-nav";

describe("WorkNav", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders nothing when neither neighbour is set", () => {
    const { container } = render(<WorkNav />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a labelled navigation landmark", () => {
    render(<WorkNav prev={{ slug: "a", title: "Alpha" }} />);
    expect(screen.getByRole("navigation", { name: "Work navigation" })).toBeInTheDocument();
  });

  it("links the previous work with a prev marker", () => {
    render(<WorkNav prev={{ slug: "alpha", title: "Alpha" }} />);

    const link = screen.getByRole("link", { name: /Alpha/ });
    expect(link).toHaveAttribute("href", "/work/alpha");
    expect(link).toHaveTextContent("prev");
  });

  it("links the next work with a next marker", () => {
    render(<WorkNav next={{ slug: "omega", title: "Omega" }} />);

    const link = screen.getByRole("link", { name: /Omega/ });
    expect(link).toHaveAttribute("href", "/work/omega");
    expect(link).toHaveTextContent("next");
  });

  it("renders both neighbours when provided", () => {
    render(
      <WorkNav prev={{ slug: "alpha", title: "Alpha" }} next={{ slug: "omega", title: "Omega" }} />,
    );

    expect(screen.getByRole("link", { name: /Alpha/ })).toHaveAttribute("href", "/work/alpha");
    expect(screen.getByRole("link", { name: /Omega/ })).toHaveAttribute("href", "/work/omega");
  });
});
