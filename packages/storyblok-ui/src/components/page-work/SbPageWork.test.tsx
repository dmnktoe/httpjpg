import { resetPreviewBadgeStore } from "@httpjpg/ui";
import { render, screen } from "@testing-library/react";
import { afterEach } from "vitest";

import { SbPageWork } from "./SbPageWork";

afterEach(() => {
  resetPreviewBadgeStore();
});

describe("SbPageWork", () => {
  it("renders body bloks", () => {
    const { container } = render(
      <SbPageWork
        blok={
          {
            _uid: "1",
            component: "page_work",
            body: [{ _uid: "c1", component: "headline", text: "Hi" }],
          } as never
        }
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders a floating preview badge for an external link", () => {
    render(
      <SbPageWork
        blok={
          {
            _uid: "2",
            component: "page_work",
            external_only: true,
            link: { linktype: "url", url: "https://external.dev" },
            accentColor: "#ec6839",
          } as never
        }
      />,
    );
    // FloatingPreviewBadge portals the cluster into document.body.
    const link = document.querySelector('a[href="https://external.dev"]') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.style.getPropertyValue("--work-accent")).toBe("#EC6839");
    const cluster = document.body.querySelector("[data-page-badge]") as HTMLElement;
    expect(cluster.style.getPropertyValue("--work-accent")).toBe("");
  });

  it("adds an edit pill when the draft _editable comment is present", () => {
    render(
      <SbPageWork
        blok={
          {
            _uid: "4",
            component: "page_work",
            _editable: '<!--#storyblok#{"space":"99","id":"42"}-->',
            link: { linktype: "url", url: "https://external.dev" },
          } as never
        }
      />,
    );
    expect(document.body.querySelector('a[href="https://external.dev"]')).not.toBeNull();
    expect(
      document.body.querySelector(
        'a[href="https://app.storyblok.com/#/me/spaces/99/stories/0/0/42"]',
      ),
    ).not.toBeNull();
    expect(screen.getByRole("status", { name: /preview mode/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show 12-column overlay (G)" })).not.toBeNull();
    expect(screen.getByRole("link", { name: "Exit draft preview" })).toHaveAttribute(
      "href",
      "/api/exit-draft",
    );
  });

  it("ignores non-external links for the preview badge", () => {
    render(
      <SbPageWork
        blok={
          {
            _uid: "3",
            component: "page_work",
            link: { linktype: "story", cached_url: "work/foo" },
          } as never
        }
      />,
    );
    // The badge portals into document.body, so assert against the portal target.
    expect(document.body.querySelector('a[aria-label*="open external preview"]')).toBeNull();
  });
});
