import { render } from "@testing-library/react";

import { SbSlideshow } from "./SbSlideshow";

describe("SbSlideshow", () => {
  it("returns null without images", () => {
    const { container } = render(
      <SbSlideshow blok={{ _uid: "1", component: "slideshow" } as never} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a slideshow with mapped images", () => {
    const { container } = render(
      <SbSlideshow
        blok={
          {
            _uid: "2",
            component: "slideshow",
            images: [
              { filename: "https://a.storyblok.com/f/1/a.jpg", alt: "A" },
              { filename: "https://a.storyblok.com/f/1/b.jpg", title: "B" },
            ],
          } as never
        }
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });
});
