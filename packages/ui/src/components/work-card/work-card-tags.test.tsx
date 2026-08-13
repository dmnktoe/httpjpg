import { render, screen } from "@testing-library/react";

import { WorkCardTags } from "./work-card-tags";

describe("WorkCardTags", () => {
  it("renders each tag", () => {
    render(<WorkCardTags tags={["design", "code"]} />);
    expect(screen.getByText("design")).toBeInTheDocument();
    expect(screen.getByText("code")).toBeInTheDocument();
  });

  it("marks each tag with a hash that screen readers skip", () => {
    const { container } = render(<WorkCardTags tags={["design"]} />);
    const markers = container.querySelectorAll('[aria-hidden="true"]');

    expect(markers).toHaveLength(1);
    expect(markers[0]).toHaveTextContent("#");
  });

  it("deduplicates repeated tags", () => {
    render(<WorkCardTags tags={["dup", "dup"]} />);
    expect(screen.getAllByText("dup")).toHaveLength(1);
  });

  it("keeps the authored casing rather than lowercasing it", () => {
    render(<WorkCardTags tags={["TypeScript", "iOS"]} />);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("iOS")).toBeInTheDocument();
  });
});
