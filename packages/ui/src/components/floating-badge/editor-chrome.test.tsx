import { fireEvent, render, screen } from "@testing-library/react";

import { EditorChrome } from "./editor-chrome";

const EDIT = "https://app.storyblok.com/#/me/spaces/1/stories/0/0/2";

describe("EditorChrome", () => {
  it("renders draft, exit, and grid", () => {
    render(<EditorChrome />);
    expect(screen.getByRole("status", { name: /preview mode/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /open external preview/ })).toBeNull();
    expect(screen.queryByRole("link", { name: "Edit in Storyblok" })).toBeNull();
    expect(screen.getByRole("link", { name: "Exit draft preview" })).toHaveAttribute(
      "href",
      "/api/exit-draft",
    );
    expect(screen.getByRole("button", { name: "Show 12-column overlay (G)" })).not.toBeNull();
  });

  it("adds the Storyblok edit pill when editHref is set", () => {
    render(<EditorChrome editHref={EDIT} />);
    expect(screen.getByRole("link", { name: "Edit in Storyblok" })).toHaveAttribute("href", EDIT);
    expect(screen.queryByRole("link", { name: /open external preview/ })).toBeNull();
  });

  it("does not tint editor pills", () => {
    render(<EditorChrome editHref={EDIT} />);
    expect(
      screen.getByRole("status", { name: /preview mode/i }).style.getPropertyValue("--work-accent"),
    ).toBe("");
    expect(
      screen
        .getByRole("link", { name: "Edit in Storyblok" })
        .style.getPropertyValue("--work-accent"),
    ).toBe("");
  });

  it("toggles the 12-column overlay from the grid pill", () => {
    render(<EditorChrome />);
    expect(document.body.querySelector("[data-editor-grid]")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show 12-column overlay (G)" }));
    expect(document.body.querySelector("[data-editor-grid]")).not.toBeNull();
    expect(document.body.querySelector("[data-editor-grid]")?.textContent).toContain("[ 01 ]");
    fireEvent.click(screen.getByRole("button", { name: "Hide 12-column overlay (G)" }));
    expect(document.body.querySelector("[data-editor-grid]")).toBeNull();
  });

  it("toggles the overlay with G and closes it with Escape", () => {
    render(<EditorChrome />);
    fireEvent.keyDown(window, { key: "g" });
    expect(document.body.querySelector("[data-editor-grid]")).not.toBeNull();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.body.querySelector("[data-editor-grid]")).toBeNull();
  });
});
