import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "./not-found";

describe("PortfolioNotFound", () => {
  it("renders the branded 404 screen", () => {
    render(<NotFound />);
    expect(screen.getByText("⇝404⇝")).toBeInTheDocument();
    expect(screen.getByText("page_not_found")).toBeInTheDocument();
  });

  it("links back to the home page", () => {
    render(<NotFound />);
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
  });
});
