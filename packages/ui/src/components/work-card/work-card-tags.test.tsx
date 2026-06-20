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
});
