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
    expect(container.querySelector("img")).not.toBeNull();
  });
});
