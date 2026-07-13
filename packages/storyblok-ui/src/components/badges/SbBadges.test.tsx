import { render, screen } from "@testing-library/react";

import { SbBadges } from "./SbBadges";

const SHIELD = "https://img.shields.io/badge/version-1.2.0-blue";

describe("SbBadges", () => {
  it("returns null without items", () => {
    const { container } = render(<SbBadges blok={{ _uid: "1", component: "badges" } as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one badge per item", () => {
    render(
      <SbBadges
        blok={
          {
            _uid: "2",
            component: "badges",
            items: [
              { _uid: "b1", component: "badge_item", src: `${SHIELD}?1`, alt: "Version" },
              { _uid: "b2", component: "badge_item", src: `${SHIELD}?2`, alt: "Downloads" },
            ],
          } as never
        }
      />,
    );
    expect(screen.getByAltText("Version")).toBeInTheDocument();
    expect(screen.getByAltText("Downloads")).toBeInTheDocument();
  });

  it("links the items that carry an href", () => {
    render(
      <SbBadges
        blok={
          {
            _uid: "3",
            component: "badges",
            items: [
              {
                _uid: "b1",
                component: "badge_item",
                src: SHIELD,
                alt: "Version",
                href: "https://github.com/dmnktoe/httpjpg/releases",
              },
            ],
          } as never
        }
      />,
    );
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://github.com/dmnktoe/httpjpg/releases",
    );
  });

  it("applies the configured badge height", () => {
    render(
      <SbBadges
        blok={
          {
            _uid: "4",
            component: "badges",
            height: "24px",
            items: [{ _uid: "b1", component: "badge_item", src: SHIELD, alt: "Version" }],
          } as never
        }
      />,
    );
    expect(screen.getByAltText("Version")).toHaveStyle({ height: "24px" });
  });
});
