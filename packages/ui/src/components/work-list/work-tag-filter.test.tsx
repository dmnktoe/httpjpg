import { fireEvent, render, screen } from "@testing-library/react";

import { WorkTagFilter } from "./work-tag-filter";

const TAGS = ["TypeScript", "React", "Print"];

describe("WorkTagFilter", () => {
  it("renders nothing when there are no tags to offer", () => {
    const { container } = render(<WorkTagFilter tags={[]} active={null} onChange={() => {}} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("hides the tags behind a collapsed toggle by default", () => {
    render(<WorkTagFilter tags={TAGS} active={null} onChange={() => {}} />);

    const toggle = screen.getByRole("button", { name: /filter/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "TypeScript" })).not.toBeInTheDocument();
  });

  it("counts the available tags on the collapsed toggle", () => {
    render(<WorkTagFilter tags={TAGS} active={null} onChange={() => {}} />);

    expect(screen.getByRole("button", { name: /filter/i })).toHaveTextContent("3 tags");
  });

  it("names the active tag on the toggle so a collapsed filter is not invisible", () => {
    render(<WorkTagFilter tags={TAGS} active="Print" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: /filter/i })).toHaveTextContent("#Print");
  });

  it("reveals the tags when the toggle is pressed", () => {
    render(<WorkTagFilter tags={TAGS} active={null} onChange={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /filter/i }));

    expect(screen.getByRole("button", { name: /filter/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: "TypeScript" })).toBeInTheDocument();
  });

  it("starts open when asked", () => {
    render(<WorkTagFilter tags={TAGS} active={null} onChange={() => {}} defaultExpanded />);

    expect(screen.getByRole("button", { name: "React" })).toBeInTheDocument();
  });

  it("reports a chosen tag", () => {
    const onChange = vi.fn();
    render(<WorkTagFilter tags={TAGS} active={null} onChange={onChange} defaultExpanded />);

    fireEvent.click(screen.getByRole("button", { name: "React" }));

    expect(onChange).toHaveBeenCalledWith("React");
  });

  it("clears the filter when the active tag is pressed again", () => {
    const onChange = vi.fn();
    render(<WorkTagFilter tags={TAGS} active="React" onChange={onChange} defaultExpanded />);

    fireEvent.click(screen.getByRole("button", { name: "React" }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("clears the filter from the all button", () => {
    const onChange = vi.fn();
    render(<WorkTagFilter tags={TAGS} active="React" onChange={onChange} defaultExpanded />);

    fireEvent.click(screen.getByRole("button", { name: "all" }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("marks the all button pressed while nothing is filtered", () => {
    render(<WorkTagFilter tags={TAGS} active={null} onChange={() => {}} defaultExpanded />);

    expect(screen.getByRole("button", { name: "all" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "React" })).toHaveAttribute("aria-pressed", "false");
  });

  it("moves the pressed state onto the active tag", () => {
    render(<WorkTagFilter tags={TAGS} active="React" onChange={() => {}} defaultExpanded />);

    expect(screen.getByRole("button", { name: "all" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "React" })).toHaveAttribute("aria-pressed", "true");
  });

  it("points the toggle at the panel it controls", () => {
    render(<WorkTagFilter tags={TAGS} active={null} onChange={() => {}} defaultExpanded />);

    const controls = screen.getByRole("button", { name: /filter/i }).getAttribute("aria-controls");

    expect(controls).toBeTruthy();
    expect(document.getElementById(controls as string)).toBeInTheDocument();
  });
});
