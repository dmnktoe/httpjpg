import { render, screen } from "@testing-library/react";

import { FeedAppBar } from "./feed-app-bar";

describe("FeedAppBar", () => {
  it("carries the title and a back button", () => {
    render(
      <FeedAppBar back={{ href: "/", label: "home" }} css={{ mb: "6" }}>
        <h1>httpgram</h1>
      </FeedAppBar>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("httpgram");
    expect(screen.getByRole("link", { name: /home/ })).toHaveAttribute("href", "/");
  });

  it("keeps the status bar out of the accessibility tree", () => {
    const { container } = render(<FeedAppBar>httpgram</FeedAppBar>);

    expect(container.querySelector("[aria-hidden='true']")).toHaveTextContent("9:41");
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.firstElementChild?.className).toContain("jpg-ov_hidden");
  });
});
