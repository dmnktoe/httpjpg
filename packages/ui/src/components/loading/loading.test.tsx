import { render, screen } from "@testing-library/react";

import { Loading } from "./loading";

describe("Loading", () => {
  it("announces a polite loading state", () => {
    render(<Loading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByText("Loading...").closest("[aria-live='polite']")).not.toBeNull();
  });

  it("hides the decorative bar from assistive tech", () => {
    render(<Loading />);
    expect(screen.getByText("▰▰▰▱▱▱▰▰▰▱▱▱")).toHaveAttribute("aria-hidden", "true");
  });
});
