import { render } from "@testing-library/react";

import { SbVideo } from "./SbVideo";

describe("SbVideo", () => {
  it("returns null when no source resolves", () => {
    const { container } = render(<SbVideo blok={{ _uid: "1", component: "video" } as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a native video when a filename is set", () => {
    const { container } = render(
      <SbVideo
        blok={
          {
            _uid: "2",
            component: "video",
            source: "native",
            video: { filename: "https://a.storyblok.com/f/1/clip.mp4" },
          } as never
        }
      />,
    );
    expect(container.querySelector("video")).not.toBeNull();
  });

  it("renders a consent placeholder for an embed source without consent", () => {
    const { container } = render(
      <SbVideo
        blok={
          {
            _uid: "3",
            component: "video",
            source: "youtube",
            videoUrl: "https://youtube.com/watch?v=abc",
          } as never
        }
      />,
    );
    // No <video> element — the consent placeholder renders instead.
    expect(container.querySelector("video")).toBeNull();
    expect(container.firstChild).not.toBeNull();
  });
});
