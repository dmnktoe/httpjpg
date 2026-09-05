import { render, screen } from "@testing-library/react";

import { SbPageWork } from "./SbPageWork";

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
    // FloatingPreviewBadge portals into document.body.
    const badge = document.querySelector('a[href="https://external.dev"]') as HTMLAnchorElement;
    expect(badge).not.toBeNull();
    expect(badge.style.getPropertyValue("--work-accent")).toBe("#EC6839");
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

  it("renders floating media frames when the work page has files", () => {
    render(
      <SbPageWork
        blok={
          {
            _uid: "4",
            component: "work",
            floating_media: [
              {
                _uid: "m1",
                component: "floating_item",
                name: "Still",
                url: "https://cdn.example/still.png",
              },
              {
                _uid: "m2",
                component: "floating_item",
                name: "Showreel",
                url: "https://cdn.example/reel.mp4",
              },
            ],
          } as never
        }
      />,
    );

    expect(screen.getByRole("figure", { name: "Still" })).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "Showreel" })).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "Still" })).toHaveAttribute(
      "data-media-kind",
      "image",
    );
    expect(screen.getByRole("figure", { name: "Showreel" })).toHaveAttribute(
      "data-media-kind",
      "video",
    );
  });

  it("renders no floating frames when floating media is empty", () => {
    render(
      <SbPageWork
        blok={
          {
            _uid: "5",
            component: "work",
            floating_media: [],
          } as never
        }
      />,
    );

    expect(screen.queryByRole("region", { name: "Work media" })).toBeNull();
  });
});
