import { fireEvent, render, screen, within } from "@testing-library/react";

import { SbImage } from "./SbImage";

const filename = "https://a.storyblok.com/f/1/image.jpg";

describe("SbImage", () => {
  it("returns null without an image filename", () => {
    const { container } = render(<SbImage blok={{ _uid: "1", component: "image" } as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("offers no lightbox trigger unless the blok asks for one", () => {
    render(
      <SbImage
        blok={
          {
            _uid: "10",
            component: "image",
            image: { filename, alt: "A photo" },
            overlay: "none",
          } as never
        }
      />,
    );
    expect(screen.queryByRole("button", { name: /full size/i })).not.toBeInTheDocument();
  });

  it("opens the image at full size, carrying its caption, credit and source", () => {
    render(
      <SbImage
        blok={
          {
            _uid: "11",
            component: "image",
            image: {
              filename,
              alt: "A photo",
              copyright: "2025 Studio",
              source: "id-100.online",
            },
            caption: {
              type: "doc",
              content: [{ type: "paragraph", content: [{ type: "text", text: "On the roof" }] }],
            },
            overlay: "none",
            lightbox: true,
          } as never
        }
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open A photo at full size" }));

    const dialog = screen.getByRole("dialog", { name: "Image viewer" });
    // Scoped to the dialog: the thumbnail carries its own caption and credit.
    expect(within(dialog).getByText("On the roof")).toBeInTheDocument();
    expect(within(dialog).getByText("© 2025 Studio")).toBeInTheDocument();
    expect(within(dialog).getByText("id-100.online")).toBeInTheDocument();
    // A lone item drops prev/next.
    expect(screen.queryByRole("button", { name: "Next image" })).not.toBeInTheDocument();
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
