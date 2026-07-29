import { render, screen } from "@testing-library/react";

import { SbImage } from "./SbImage";

const filename = "https://a.storyblok.com/f/1/image.jpg";

describe("SbImage", () => {
  it("returns null without an image filename", () => {
    const { container } = render(<SbImage blok={{ _uid: "1", component: "image" } as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders no caption for an empty richtext document", () => {
    const { container } = render(
      <SbImage
        blok={
          {
            _uid: "5",
            component: "image",
            image: { filename, alt: "A photo" },
            caption: { type: "doc", content: [] },
            overlay: "none",
          } as never
        }
      />,
    );
    expect(screen.getByRole("img", { name: "A photo" })).toBeInTheDocument();
    expect(container.textContent).toBe("");
  });

  it("renders an img with resolved alt text", () => {
    render(
      <SbImage
        blok={
          {
            _uid: "2",
            component: "image",
            image: { filename, alt: "A photo" },
            overlay: "none",
          } as never
        }
      />,
    );
    expect(screen.getByRole("img", { name: "A photo" })).toBeInTheDocument();
  });

  it("renders with a parallax wrapper when parallax is enabled", () => {
    const { container } = render(
      <SbImage
        blok={
          {
            _uid: "3",
            component: "image",
            image: { filename, alt: "P" },
            parallax: 0.2,
            overlay: "none",
          } as never
        }
      />,
    );
    expect(container.querySelector("img")).not.toBeNull();
  });
});
