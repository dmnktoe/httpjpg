import { render, screen } from "@testing-library/react";

import { WorkCardDate } from "./work-card-date";

describe("WorkCardDate", () => {
  it("renders a single date with day and year", () => {
    render(<WorkCardDate date="2024-06-15" />);
    expect(screen.getByText(/15\./)).toBeInTheDocument();
    expect(screen.getByText(/24/)).toBeInTheDocument();
  });

  it("renders a date range with an arrow separator", () => {
    render(<WorkCardDate date="2024-01-01" dateEnd="2024-12-31" />);
    expect(screen.getByText("→")).toBeInTheDocument();
  });
});
