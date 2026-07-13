import { render, screen } from "@testing-library/react";

import { Badge } from "./badge";
import { BadgeGroup } from "./badge-group";
import { Badges } from "./badges";

const SHIELD = "https://img.shields.io/badge/version-1.0.0-blue";

describe("Badge", () => {
  it("renders an image with src and alt", () => {
    render(<Badge src={SHIELD} alt="Version" />);
    const img = screen.getByAltText("Version");
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("src", SHIELD);
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("renders at the default height", () => {
    render(<Badge src={SHIELD} alt="Version" />);
    expect(screen.getByAltText("Version")).toHaveStyle({ height: "1.5em" });
  });

  it("accepts a custom height", () => {
    render(<Badge src={SHIELD} alt="Version" height="28px" />);
    expect(screen.getByAltText("Version")).toHaveStyle({ height: "28px" });
  });

  it("renders no link when href is omitted", () => {
    render(<Badge src={SHIELD} alt="Version" />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("wraps in an external link that opens in a new tab", () => {
    render(<Badge src={SHIELD} alt="Version" href="https://github.com/dmnktoe/httpjpg/releases" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://github.com/dmnktoe/httpjpg/releases");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toContainElement(screen.getByAltText("Version"));
  });

  it("wraps an internal href without opening a new tab", () => {
    render(<Badge src={SHIELD} alt="Version" href="/downloads" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/downloads");
    expect(link).not.toHaveAttribute("target");
  });

  it("forwards extra image attributes", () => {
    render(<Badge src={SHIELD} alt="Version" data-testid="badge" title="latest release" />);
    const img = screen.getByTestId("badge");
    expect(img).toHaveAttribute("title", "latest release");
  });
});

describe("BadgeGroup", () => {
  it("renders its children", () => {
    render(
      <BadgeGroup>
        <Badge src={SHIELD} alt="one" />
        <Badge src={SHIELD} alt="two" />
      </BadgeGroup>,
    );
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("is block-level (a div) by default", () => {
    const { container } = render(
      <BadgeGroup>
        <Badge src={SHIELD} alt="one" />
      </BadgeGroup>,
    );
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });

  it("renders inline as a span so it stays valid inside a paragraph", () => {
    const { container } = render(
      <BadgeGroup inline>
        <Badge src={SHIELD} alt="one" />
      </BadgeGroup>,
    );
    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });

  it("forwards extra props to the root", () => {
    render(
      <BadgeGroup data-testid="group">
        <Badge src={SHIELD} alt="one" />
      </BadgeGroup>,
    );
    expect(screen.getByTestId("group")).toBeInTheDocument();
  });
});

describe("Badges", () => {
  const items = [
    { src: `${SHIELD}?1`, alt: "Version" },
    { src: `${SHIELD}?2`, alt: "Downloads", href: "https://github.com/dmnktoe/httpjpg/releases" },
    { src: `${SHIELD}?3`, alt: "macOS" },
  ];

  it("renders one badge per item", () => {
    render(<Badges items={items} />);
    expect(screen.getAllByRole("img")).toHaveLength(3);
  });

  it("renders nothing when there are no items", () => {
    const { container } = render(<Badges items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("links the items that carry an href", () => {
    render(<Badges items={items} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "https://github.com/dmnktoe/httpjpg/releases");
  });

  it("applies a shared height to every badge", () => {
    render(<Badges items={items} height="24px" />);
    for (const img of screen.getAllByRole("img")) {
      expect(img).toHaveStyle({ height: "24px" });
    }
  });

  it("can render inline as a span", () => {
    const { container } = render(<Badges items={items} inline />);
    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });
});
