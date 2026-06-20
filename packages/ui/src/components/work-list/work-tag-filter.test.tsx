import { fireEvent, render, screen } from "@testing-library/react";

import { WorkTagFilter } from "./work-tag-filter";

function Scope() {
  return (
    <div data-work-list>
      <article data-tags="design, code">A</article>
      <article data-tags="code">B</article>
      <WorkTagFilter />
    </div>
  );
}

describe("WorkTagFilter", () => {
  it("renders nothing when there are no tagged cards", () => {
    const { container } = render(
      <div data-work-list>
        <WorkTagFilter />
      </div>,
    );
    // The filter renders null (no tags), so only the empty scope div remains.
    expect(container.querySelector("button")).toBeNull();
  });

  it("collects sorted, unique tags into filter buttons", () => {
    render(<Scope />);
    expect(screen.getByRole("button", { name: "all" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "#code" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "#design" })).toBeInTheDocument();
  });

  it("filters cards when a tag is selected and resets via all", () => {
    render(<Scope />);
    const cards = document.querySelectorAll<HTMLElement>("[data-tags]");

    fireEvent.click(screen.getByRole("button", { name: "#design" }));
    // Card B has only "code" so it is hidden when filtering by "design".
    expect(cards[1].style.display).toBe("none");

    fireEvent.click(screen.getByRole("button", { name: "all" }));
    expect(cards[1].style.display).toBe("");
  });
});
