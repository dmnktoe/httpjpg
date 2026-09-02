import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";

import { FloatingPreviewBadge } from "./floating-preview-badge";

const HREF = "https://example.com/preview";

describe("FloatingPreviewBadge", () => {
  it("renders an anchor with the given href and external-link attrs", () => {
    render(<FloatingPreviewBadge href={HREF} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", HREF);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("portals the cluster directly into document.body, not the render container", () => {
    const { container } = render(<FloatingPreviewBadge href={HREF} />);
    expect(container.querySelector("[data-page-badge]")).toBeNull();
    expect(document.body.querySelector("[data-page-badge]")).not.toBeNull();
  });

  it("uses the default 'preview' label in the aria-label", () => {
    render(<FloatingPreviewBadge href={HREF} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("aria-label")).toContain("preview");
    expect(link.getAttribute("aria-label")).toContain("open external preview");
  });

  it("renders a custom label in the aria-label", () => {
    render(<FloatingPreviewBadge href={HREF} label="demo site" />);
    expect(screen.getByRole("link").getAttribute("aria-label")).toContain("demo site");
  });

  it("renders the external-link arrow glyph", () => {
    render(<FloatingPreviewBadge href={HREF} />);
    expect(screen.getByRole("link").textContent).toContain("↗");
  });

  it("renders the kawaii desktop prefix in the markup (visibility is breakpoint-controlled)", () => {
    render(<FloatingPreviewBadge href={HREF} />);
    const text = screen.getByRole("link").textContent ?? "";
    expect(text).toContain("(っ◔◡◔)っ");
    expect(text).toContain("♥");
    expect(text).toContain("preview");
  });

  it("applies the backdrop-filter inline so it can't be stripped by extraction", () => {
    render(<FloatingPreviewBadge href={HREF} />);
    const link = screen.getByRole("link") as HTMLAnchorElement;
    expect(link.style.backdropFilter).toMatch(/blur/);
    expect(link.style.backdropFilter).toMatch(/saturate/);
  });

  it("forwards refs to the cluster", () => {
    const ref = createRef<HTMLDivElement>();
    render(<FloatingPreviewBadge href={HREF} ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("DIV");
    expect(ref.current).toHaveAttribute("data-page-badge");
  });

  it("merges a custom className with the generated styles", () => {
    render(<FloatingPreviewBadge href={HREF} className="my-badge" />);
    expect(document.body.querySelector("[data-page-badge]")).toHaveClass("my-badge");
  });

  it("paints the portalled cluster with the work accent so it survives the portal", () => {
    render(<FloatingPreviewBadge href={HREF} accentColor="#ec6839" />);
    const cluster = document.body.querySelector("[data-page-badge]") as HTMLElement;
    expect(cluster.style.getPropertyValue("--work-accent")).toBe("#EC6839");
    expect(cluster.style.getPropertyValue("--work-on-accent")).toBe("#ffffff");
    expect(cluster.style.getPropertyValue("--work-accent-fill")).toBe("rgba(236, 104, 57, 0.62)");
  });

  it("lets a caller override the inline style without losing accent vars", () => {
    render(<FloatingPreviewBadge href={HREF} style={{ opacity: 0.5 }} />);
    const cluster = document.body.querySelector("[data-page-badge]") as HTMLElement;
    expect(cluster.style.opacity).toBe("0.5");
  });

  it("renders extra editor actions beside the preview", () => {
    render(
      <FloatingPreviewBadge
        href={HREF}
        actions={[
          {
            href: "https://app.storyblok.com/#/me/spaces/1/stories/0/0/2",
            label: "edit",
            glyph: "✎",
            ariaLabel: "Edit in Storyblok",
          },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: /open external preview/ })).toHaveAttribute(
      "href",
      HREF,
    );
    expect(screen.getByRole("link", { name: "Edit in Storyblok" })).toHaveAttribute(
      "href",
      "https://app.storyblok.com/#/me/spaces/1/stories/0/0/2",
    );
  });

  it("renders editor actions without a preview href", () => {
    render(
      <FloatingPreviewBadge
        actions={[
          {
            href: "https://app.storyblok.com/#/me/spaces/1/stories/0/0/2",
            label: "edit",
            glyph: "✎",
            ariaLabel: "Edit in Storyblok",
          },
        ]}
      />,
    );
    expect(screen.queryByRole("link", { name: /open external preview/ })).toBeNull();
    expect(screen.getByRole("link", { name: "Edit in Storyblok" })).not.toBeNull();
  });

  it("toggles the 12-column overlay from the grid pill", () => {
    render(<FloatingPreviewBadge href={HREF} gridToggle />);
    expect(document.body.querySelector("[data-editor-grid]")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show 12-column overlay (G)" }));
    expect(document.body.querySelector("[data-editor-grid]")).not.toBeNull();
    expect(document.body.querySelector("[data-editor-grid]")?.textContent).toContain("[ 01 ]");
    fireEvent.click(screen.getByRole("button", { name: "Hide 12-column overlay (G)" }));
    expect(document.body.querySelector("[data-editor-grid]")).toBeNull();
  });

  it("closes the overlay when gridToggle is turned off", () => {
    const { rerender } = render(<FloatingPreviewBadge href={HREF} gridToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Show 12-column overlay (G)" }));
    expect(document.body.querySelector("[data-editor-grid]")).not.toBeNull();
    rerender(<FloatingPreviewBadge href={HREF} gridToggle={false} />);
    expect(document.body.querySelector("[data-editor-grid]")).toBeNull();
  });

  it("toggles the overlay with G and closes it with Escape", () => {
    render(<FloatingPreviewBadge href={HREF} gridToggle />);
    fireEvent.keyDown(window, { key: "g" });
    expect(document.body.querySelector("[data-editor-grid]")).not.toBeNull();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.body.querySelector("[data-editor-grid]")).toBeNull();
  });

  it("renders a presentational draft status pill", () => {
    render(
      <FloatingPreviewBadge
        actions={[
          {
            label: "draft",
            glyph: "🔍",
            ariaLabel: "Preview mode — unpublished content",
            presentational: true,
          },
        ]}
      />,
    );
    const status = screen.getByRole("status", { name: /preview mode/i });
    expect(status.tagName).toBe("OUTPUT");
    expect(status).toHaveTextContent("draft");
  });

  it("renders a same-tab exit-draft pill", () => {
    render(
      <FloatingPreviewBadge
        actions={[
          {
            href: "/api/exit-draft",
            label: "exit",
            glyph: "×",
            ariaLabel: "Exit draft preview",
            external: false,
          },
        ]}
      />,
    );
    const link = screen.getByRole("link", { name: "Exit draft preview" });
    expect(link).toHaveAttribute("href", "/api/exit-draft");
    expect(link).not.toHaveAttribute("target");
  });

  it("renders nothing when there is no preview, action, or grid toggle", () => {
    render(<FloatingPreviewBadge />);
    expect(document.body.querySelector("[data-page-badge]")).toBeNull();
  });
});
