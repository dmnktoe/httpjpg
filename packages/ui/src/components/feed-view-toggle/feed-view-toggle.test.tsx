import { fireEvent, render, screen } from "@testing-library/react";

import { FeedViewToggle } from "./feed-view-toggle";

describe("FeedViewToggle", () => {
  it("presses the chosen view", () => {
    render(<FeedViewToggle view="list" onViewChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: /list/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /grid/ })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: /list/ })).toHaveAttribute("data-state", "on");
    expect(screen.getByRole("button", { name: /grid/ })).toHaveAttribute("data-state", "off");
  });

  it("leaves the pressed state to the viewport while the view is automatic", () => {
    render(<FeedViewToggle view="auto" onViewChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: /grid/ })).not.toHaveAttribute("aria-pressed");
    expect(screen.getByRole("button", { name: /grid/ })).toHaveAttribute("data-state", "wide");
    expect(screen.getByRole("button", { name: /list/ })).toHaveAttribute("data-state", "narrow");
  });

  it("reports the view that was picked", () => {
    const onViewChange = vi.fn();
    render(<FeedViewToggle view="grid" onViewChange={onViewChange} css={{ mb: "6" }} />);

    fireEvent.click(screen.getByRole("button", { name: /list/ }));

    expect(onViewChange).toHaveBeenCalledWith("list");
    expect(screen.getByRole("group", { name: "Feed layout" }).className).toContain("jpg-mb_6");
  });
});
