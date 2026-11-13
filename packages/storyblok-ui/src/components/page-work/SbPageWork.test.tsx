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

  it("renders a live-URL pill for an external link", () => {
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
    // PageActions portals the pill row into document.body.
    const link = document.querySelector('a[href="https://external.dev"]') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.style.getPropertyValue("--work-accent")).toBe("#EC6839");
    const cluster = document.body.querySelector("[data-floating-action-bar]") as HTMLElement;
    expect(cluster.style.getPropertyValue("--work-accent")).toBe("");
  });

  it("adds draft tools and an edit pill when the draft _editable comment is present", () => {
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
    expect(screen.getByRole("status", { name: /draft preview/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "12-column overlay (G)" })).not.toBeNull();
    expect(screen.getByRole("link", { name: "Exit draft preview" })).toHaveAttribute(
      "href",
      "/api/exit-draft",
    );
  });

  it("ignores non-external links for the live-URL pill", () => {
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
    // The bar portals into document.body, so assert against the portal target.
    expect(document.body.querySelector('a[aria-label*="open external preview"]')).toBeNull();
  });

  it("renders desktop download icons when the work page has files", () => {
    render(
      <SbPageWork
        blok={
          {
            _uid: "4",
            component: "work",
            downloads: [
              {
                _uid: "d1",
                component: "download_item",
                name: "Press kit.pdf",
                url: "https://cdn.example/press.pdf",
              },
              { _uid: "d2", component: "download_item", name: "  ", url: "https://cdn.example/x" },
            ],
          } as never
        }
      />,
    );

    expect(screen.getByRole("button", { name: "Download Press kit.pdf" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Download   " })).toBeNull();
  });

  it("renders no desktop icons when downloads are empty", () => {
    render(
      <SbPageWork
        blok={
          {
            _uid: "5",
            component: "work",
            downloads: [],
          } as never
        }
      />,
    );

    expect(screen.queryByRole("region", { name: "Work downloads" })).toBeNull();
  });

  it("renders desktop media windows when the work page has media", () => {
    render(
      <SbPageWork
        blok={
          {
            _uid: "6",
            component: "work",
            desktop_media: [
              {
                _uid: "m1",
                component: "desktop_media_item",
                name: "Still",
                url: "https://cdn.example/still.png",
              },
              {
                _uid: "m2",
                component: "desktop_media_item",
                name: "Showreel",
                url: "https://cdn.example/reel.mp4",
              },
            ],
          } as never
        }
      />,
    );

    expect(screen.getByRole("figure", { name: "Still" })).toHaveAttribute(
      "data-media-kind",
      "image",
    );
    expect(screen.getByRole("figure", { name: "Showreel" })).toHaveAttribute(
      "data-media-kind",
      "video",
    );
  });

  it("renders no media layer when desktop media is empty", () => {
    render(<SbPageWork blok={{ _uid: "7", component: "work", desktop_media: [] } as never} />);
    expect(screen.queryByRole("region", { name: "Work media" })).toBeNull();
  });
});
