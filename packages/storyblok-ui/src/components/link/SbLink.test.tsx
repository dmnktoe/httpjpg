import { render, screen } from "@testing-library/react";

import { SbLink } from "./SbLink";

describe("SbLink", () => {
  it("returns null when the link resolves to an empty href", () => {
    const { container } = render(
      <SbLink blok={{ _uid: "1", component: "link", text: "x" } as never} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders an anchor with the resolved href", () => {
    render(
      <SbLink
        blok={
          {
            _uid: "2",
            component: "link",
            text: "Home",
            link: { linktype: "story", cached_url: "about" },
          } as never
        }
      />,
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/about");
  });
});
