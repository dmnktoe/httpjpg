import { render, screen } from "@testing-library/react";

import { SbMarquee } from "./SbMarquee";

describe("SbMarquee", () => {
  it("returns null without text", () => {
    const { container } = render(<SbMarquee blok={{ _uid: "1", component: "marquee" } as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the marquee text", () => {
    render(<SbMarquee blok={{ _uid: "2", component: "marquee", text: "Scrolling" } as never} />);
    expect(screen.getAllByText("Scrolling").length).toBeGreaterThan(0);
  });
});
