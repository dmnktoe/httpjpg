import { render, screen } from "@testing-library/react";

import { SbAccordion } from "./SbAccordion";

describe("SbAccordion", () => {
  it("returns null without items", () => {
    const { container } = render(
      <SbAccordion blok={{ _uid: "1", component: "accordion" } as never} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders accordion item titles", () => {
    render(
      <SbAccordion
        blok={
          {
            _uid: "2",
            component: "accordion",
            items: [{ _uid: "a1", title: "Question", content: "Answer" }],
          } as never
        }
      />,
    );
    expect(screen.getByText("Question")).toBeInTheDocument();
  });
});
