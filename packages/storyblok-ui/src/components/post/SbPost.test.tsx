import { LightboxProvider } from "@httpjpg/ui";
import { fireEvent, render, screen } from "@testing-library/react";

import { SbPost } from "./SbPost";

const IMAGE = "https://a.storyblok.com/f/1/2592x1944/abc/dsc0001.jpg";

function post(overrides: Record<string, unknown> = {}) {
  return {
    _uid: "post-1",
    component: "post",
    caption: "  harbour, last night  ",
    date: "2026-11-25 10:00",
    images: [
      { _uid: "img-1", component: "post_image", image: { filename: IMAGE, alt: "Harbour" } },
      {
        _uid: "img-2",
        component: "post_image",
        alt: "Ferry",
        fit: "contain",
        image: { filename: "https://a.storyblok.com/f/1/1000x1250/def/ferry.jpg" },
      },
    ],
    ...overrides,
  } as never;
}

function frame(container: HTMLElement): HTMLElement {
  return container.querySelector("[data-feed-frame]") as HTMLElement;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-12-24T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SbPost", () => {
  it("renders nothing without images or music", () => {
    const { container } = render(<SbPost blok={post({ images: [], music: [] })} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("skips images without a file", () => {
    const { container } = render(
      <SbPost
        blok={post({
          images: [{ _uid: "empty", component: "post_image", image: { filename: "" } }],
        })}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders images through the image service, with caption and date", () => {
    const { container } = render(<SbPost blok={post()} href="/feed/2026-11-25-100000" />);

    expect(screen.getByAltText("Harbour").getAttribute("src")).toContain(`${IMAGE}/m/1920x0`);
    expect(screen.getByAltText("Ferry").className).toContain("jpg-obj-f_contain");
    expect(screen.getByText("harbour, last night")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "2026-11-25" })).toHaveAttribute(
      "href",
      "/feed/2026-11-25-100000",
    );
    expect(frame(container).style.getPropertyValue("--feed-ratio")).toBe("1/1");
  });

  it("tells a recent post's age, and keeps the date for machines", () => {
    vi.setSystemTime(new Date("2026-11-25T13:30:00Z"));
    render(<SbPost blok={post()} href="/feed/a" />);

    expect(screen.getByText("3 h ago")).toHaveAttribute("datetime", "2026-11-25");
  });

  it("opens the post from its images when it has a permalink", () => {
    render(<SbPost blok={post()} href="/feed/a" />);

    expect(screen.getByRole("link", { name: "Open the post: Ferry" })).toHaveAttribute(
      "href",
      "/feed/a",
    );
    expect(screen.queryByRole("button", { name: /at full size/ })).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("uses the chosen format", () => {
    const { container } = render(<SbPost blok={post({ format: "4/5" })} />);

    expect(frame(container).style.getPropertyValue("--feed-ratio")).toBe("4/5");
  });

  it("frames an original post in its first image's ratio", () => {
    const { container } = render(<SbPost blok={post({ format: "original" })} />);

    expect(frame(container).style.getPropertyValue("--feed-ratio")).toBe("2592/1944");
  });

  it("falls back to a square when the original has no dimensions", () => {
    const { container } = render(
      <SbPost
        blok={post({
          format: "original",
          images: [
            { _uid: "ext", component: "post_image", image: { filename: "https://x.test/a.jpg" } },
          ],
        })}
      />,
    );

    expect(frame(container).style.getPropertyValue("--feed-ratio")).toBe("1/1");
  });

  it("drops a date it cannot read", () => {
    render(<SbPost blok={post({ date: "soon" })} />);

    expect(document.querySelector("time")).toBeNull();
  });

  it("renders a music post without a frame", () => {
    const { container } = render(
      <SbPost
        blok={post({
          images: [],
          music: [
            {
              _uid: "m1",
              component: "music_player",
              source: "mp3",
              src: "https://a.storyblok.com/f/1/abc/mix.mp3",
              title: "mega mashup",
            },
          ],
        })}
      />,
    );

    expect(container.querySelector("audio")).not.toBeNull();
    expect(frame(container)).toBeNull();
  });

  it("ignores a music blok without a source", () => {
    const { container } = render(
      <SbPost blok={post({ music: [{ _uid: "m1", component: "music_player" }] })} />,
    );

    expect(container.querySelector("audio")).toBeNull();
    expect(frame(container)).not.toBeNull();
  });

  it("opens its own lightbox outside a page gallery", () => {
    render(<SbPost blok={post()} />);

    fireEvent.click(screen.getByRole("button", { name: "Open Ferry at full size" }));

    const dialog = screen.getByRole("dialog");
    const image = dialog.querySelector("img");
    expect(image?.getAttribute("src")).toContain("ferry.jpg/m/2560x0");
    expect(image?.style.getPropertyValue("--lightbox-ratio")).toBe("0.8");
    expect(image?.style.backgroundImage).toContain("ferry.jpg/m/1920x0");
  });

  it("opens the page gallery when there is one", () => {
    const onOpen = vi.fn();
    render(
      <LightboxProvider onOpen={onOpen}>
        <SbPost blok={post()} />
      </LightboxProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open Ferry at full size" }));

    expect(onOpen).toHaveBeenCalledWith(
      expect.objectContaining({ id: "img-2", caption: "harbour, last night" }),
      1,
      2,
    );
  });
});
