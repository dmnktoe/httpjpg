import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Accordion } from "./accordion";

const ITEMS = [
  { id: "a", title: "First", content: "Content A" },
  { id: "b", title: "Second", content: "Content B" },
  { id: "c", title: "Third", content: "Content C", defaultOpen: true },
];

describe("Accordion", () => {
  it("renders all item titles", () => {
    render(<Accordion items={ITEMS} />);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getByText("Third")).toBeInTheDocument();
  });

  it("opens defaultOpen items on mount", () => {
    render(<Accordion items={ITEMS} />);
    const panel = screen.getByRole("region", { name: "Third" });
    expect(panel).toBeVisible();
    expect(panel).toHaveTextContent("Content C");
  });

  it("keeps closed items hidden", () => {
    render(<Accordion items={ITEMS} />);
    expect(screen.queryByText("Content A")).not.toBeInTheDocument();
  });

  it("toggles a panel on click", () => {
    render(<Accordion items={ITEMS} />);

    const trigger = screen.getByRole("button", { name: /First/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Content A")).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes other panels in single mode", () => {
    render(<Accordion items={ITEMS} />);

    const first = screen.getByRole("button", { name: /First/i });
    const third = screen.getByRole("button", { name: /Third/i });

    expect(third).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(first);

    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(third).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps multiple panels open when allowMultiple is set", () => {
    render(<Accordion items={ITEMS} allowMultiple />);

    const first = screen.getByRole("button", { name: /First/i });
    const third = screen.getByRole("button", { name: /Third/i });

    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(third).toHaveAttribute("aria-expanded", "true");
  });

  it("returns empty for no items", () => {
    const { container } = render(<Accordion items={[]} />);
    expect(container.querySelector("[data-accordion-item]")).toBeNull();
  });
});
