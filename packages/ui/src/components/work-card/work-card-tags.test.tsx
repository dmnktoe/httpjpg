import { render, screen } from "@testing-library/react";

import { WorkCardTags } from "./work-card-tags";

describe("WorkCardTags", () => {
  it("renders each tag prefixed with a hash", () => {
    render(<WorkCardTags tags={["design", "code"]} />);
    expect(screen.getByText("#design")).toBeInTheDocument();
    expect(screen.getByText("#code")).toBeInTheDocument();
  });

  it("deduplicates repeated tags", () => {
    render(<WorkCardTags tags={["dup", "dup"]} />);
    expect(screen.getAllByText("#dup")).toHaveLength(1);
  });

  // The curated vocabulary distinguishes "TypeScript" from "typescript" and
  // the filter beside these chips renders the label as authored, so a
  // lowercasing transform here would both lose information and disagree.
  it("keeps the authored casing rather than lowercasing it", () => {
    render(<WorkCardTags tags={["TypeScript", "iOS"]} />);
    expect(screen.getByText("#TypeScript")).not.toHaveClass("tt_lowercase");
    expect(screen.getByText("#iOS")).toBeInTheDocument();
  });
});
