import { fireEvent, render, screen } from "@testing-library/react";

import { EditorChrome } from "./editor-chrome";

const PREVIEW = "https://example.com/preview";
const EDIT = "https://app.storyblok.com/#/me/spaces/1/stories/0/0/2";

describe("EditorChrome", () => {
  it("always renders draft, exit, and grid — without a work URL", () => {
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

  it("adds the content preview pill only when a live URL is passed", () => {
    render(<EditorChrome previewHref={PREVIEW} editHref={EDIT} />);
    expect(screen.getByRole("link", { name: /open external preview/ })).toHaveAttribute(
      "href",
      PREVIEW,
    );
    expect(screen.getByRole("link", { name: "Edit in Storyblok" })).toHaveAttribute("href", EDIT);
  });

  it("tints only the preview pill when a work accent is set", () => {
    render(<EditorChrome previewHref={PREVIEW} editHref={EDIT} accentColor="#ec6839" />);
    const cluster = document.body.querySelector("[data-page-badge]") as HTMLElement;
    expect(cluster.style.getPropertyValue("--work-accent")).toBe("");
    const preview = screen.getByRole("link", { name: /open external preview/ });
    expect(preview.style.getPropertyValue("--work-accent")).toBe("#EC6839");
    expect(
      screen
        .getByRole("link", { name: "Edit in Storyblok" })
        .style.getPropertyValue("--work-accent"),
    ).toBe("");
    expect(
      screen.getByRole("status", { name: /preview mode/i }).style.getPropertyValue("--work-accent"),
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
