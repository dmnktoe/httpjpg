import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "./not-found";

describe("DynamicNotFound", () => {
  it("renders the branded 404 screen", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
