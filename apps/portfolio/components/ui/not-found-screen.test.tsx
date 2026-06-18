import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { NotFoundScreen } from "./not-found-screen";

describe("NotFoundScreen", () => {
  afterEach(cleanup);

  it("renders the 404 message", () => {
    render(<NotFoundScreen />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("links back to the home page", () => {
    render(<NotFoundScreen />);
    expect(screen.getByRole("link", { name: /back to/i })).toHaveAttribute("href", "/");
  });
});
