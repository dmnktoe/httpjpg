import { render } from "@testing-library/react";

import { SbScrollClipImage } from "./SbScrollClipImage";

const filename = "https://a.storyblok.com/f/1/image.jpg";

describe("SbScrollClipImage", () => {
  it("returns null without an image filename", () => {
    const { container } = render(
      <SbScrollClipImage blok={{ _uid: "1", component: "scroll_clip_image" } as never} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the clip image and resolves an optional link", () => {
    const { container } = render(
      <SbScrollClipImage
        blok={
          {
            _uid: "2",
            component: "scroll_clip_image",
            image: { filename, alt: "Clip" },
            link: { linktype: "url", url: "https://x.dev" },
          } as never
        }
      />,
    );
    expect(container.querySelector('img[alt="Clip"]')).not.toBeNull();
    // An optional URL link wraps the image in an anchor.
    expect(container.querySelector('a[href="https://x.dev"]')).not.toBeNull();
  });

  it("falls back to the image title, pins, and renders a caption", () => {
    const { container } = render(
      <SbScrollClipImage
        blok={
          {
            _uid: "3",
            component: "scroll_clip_image",
            image: { filename, title: "Still", copyright: "Studio", source: "film" },
            pin: true,
            pinDistance: "",
            caption: {
              type: "doc",
              content: [{ type: "paragraph", content: [{ type: "text", text: "A still" }] }],
            },
          } as never
        }
      />,
    );
    expect(container.querySelector('img[alt="Still"]')).not.toBeNull();
    expect(container.textContent).toContain("A still");
  });
});
