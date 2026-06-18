import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import RootNotFound from "./not-found";

describe("RootNotFound", () => {
  it("renders the branded 404 screen", () => {
    render(<RootNotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
