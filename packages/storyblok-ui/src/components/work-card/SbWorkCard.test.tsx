import { render, screen } from "@testing-library/react";

import { SbWorkCard } from "./SbWorkCard";

describe("SbWorkCard", () => {
  it("returns null without images", () => {
    const { container } = render(
      <SbWorkCard blok={{ _uid: "1", component: "work_card", title: "T" } as never} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the work card with a parsed tag list", () => {
    render(
      <SbWorkCard
        blok={
          {
            _uid: "2",
            component: "work_card",
            title: "My Project",
            slug: "my-project",
            tags: "design, code, ",
            images: [{ filename: "https://a.storyblok.com/f/1/a.jpg", alt: "A" }],
          } as never
        }
      />,
    );
    expect(screen.getByText("My Project")).toBeInTheDocument();
  });
});
