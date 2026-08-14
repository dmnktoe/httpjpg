import { fireEvent, render, screen } from "@testing-library/react";

import { Lightbox, type LightboxItem, type LightboxProps } from "./lightbox";

const ITEMS: LightboxItem[] = [
  { src: "/one.jpg", alt: "One", caption: "The first one", copyright: "2025 Studio" },
  { src: "/two.jpg", alt: "Two" },
  { src: "/three.jpg", alt: "Three" },
];

function setup(overrides: Partial<LightboxProps> = {}) {
  const props: LightboxProps = {
    open: true,
    items: ITEMS,
    index: 0,
    onClose: vi.fn(),
    onIndexChange: vi.fn(),
    ...overrides,
  };
  render(<Lightbox {...props} />);
  return props;
}

function dialog(): HTMLElement {
  return screen.getByRole("dialog");
}

describe("Lightbox", () => {
  it("renders nothing when closed", () => {
    setup({ open: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders nothing when there is no item at the index", () => {
    setup({ items: [] });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the item at the given index", () => {
    setup({ index: 1 });

    expect(screen.getByRole("img", { name: "Two" })).toHaveAttribute("src", "/two.jpg");
  });

  it("clamps an out-of-range index instead of blanking", () => {
    setup({ index: 99 });

    expect(screen.getByRole("img", { name: "Three" })).toBeInTheDocument();
  });

  it("renders the caption and the credit", () => {
    setup();

    expect(screen.getByText("The first one")).toBeInTheDocument();
    expect(screen.getByText("© 2025 Studio")).toBeInTheDocument();
  });

  it("omits the caption bar when the item carries neither", () => {
    setup({ index: 1 });

    expect(screen.queryByText(/©/)).not.toBeInTheDocument();
  });

  it("counts the items", () => {
    setup({ index: 1 });

    expect(screen.getByText("[ 02 / 03 ]")).toBeInTheDocument();
  });

  it("drops the navigation for a single item", () => {
    setup({ items: [ITEMS[0]!] });

    expect(screen.queryByRole("button", { name: "Next image" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close image viewer" })).toBeInTheDocument();
  });

  it("advances on next", () => {
    const props = setup({ index: 0 });

    fireEvent.click(screen.getByRole("button", { name: "Next image" }));

    expect(props.onIndexChange).toHaveBeenCalledWith(1);
  });

  it("wraps forward past the last item", () => {
    const props = setup({ index: 2 });

    fireEvent.click(screen.getByRole("button", { name: "Next image" }));

    expect(props.onIndexChange).toHaveBeenCalledWith(0);
  });

  it("wraps backward past the first item", () => {
    const props = setup({ index: 0 });

    fireEvent.click(screen.getByRole("button", { name: "Previous image" }));

    expect(props.onIndexChange).toHaveBeenCalledWith(2);
  });

  it("navigates with the arrow keys", () => {
    const props = setup({ index: 1 });

    fireEvent.keyDown(dialog(), { key: "ArrowRight" });
    expect(props.onIndexChange).toHaveBeenCalledWith(2);

    fireEvent.keyDown(dialog(), { key: "ArrowLeft" });
    expect(props.onIndexChange).toHaveBeenCalledWith(0);
  });

  it("closes on Escape", () => {
    const props = setup();

    fireEvent.keyDown(dialog(), { key: "Escape" });

    expect(props.onClose).toHaveBeenCalled();
  });

  it("closes on the close button", () => {
    const props = setup();

    fireEvent.click(screen.getByRole("button", { name: "Close image viewer" }));

    expect(props.onClose).toHaveBeenCalled();
  });

  it("closes on a backdrop press but not on a press inside the frame", () => {
    const props = setup();

    fireEvent.mouseDown(dialog());
    expect(props.onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(dialog().parentElement!);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it("advances on a leftward swipe and goes back on a rightward one", () => {
    const props = setup({ index: 0 });
    const figure = screen.getByRole("img", { name: "One" }).parentElement!;

    fireEvent.pointerDown(figure, { clientX: 300 });
    fireEvent.pointerUp(figure, { clientX: 200 });
    expect(props.onIndexChange).toHaveBeenCalledWith(1);

    fireEvent.pointerDown(figure, { clientX: 200 });
    fireEvent.pointerUp(figure, { clientX: 300 });
    expect(props.onIndexChange).toHaveBeenLastCalledWith(2);
  });

  it("ignores a drag too short to be a swipe", () => {
    const props = setup();
    const figure = screen.getByRole("img", { name: "One" }).parentElement!;

    fireEvent.pointerDown(figure, { clientX: 300 });
    fireEvent.pointerUp(figure, { clientX: 280 });

    expect(props.onIndexChange).not.toHaveBeenCalled();
  });

  it("ignores a release that never started on the frame", () => {
    const props = setup();
    const figure = screen.getByRole("img", { name: "One" }).parentElement!;

    fireEvent.pointerUp(figure, { clientX: 0 });

    expect(props.onIndexChange).not.toHaveBeenCalled();
  });

  it("cycles focus inside the dialog rather than escaping it", () => {
    setup();
    const buttons = screen.getAllByRole("button");
    const first = buttons[0]!;
    const last = buttons[buttons.length - 1]!;

    last.focus();
    fireEvent.keyDown(dialog(), { key: "Tab" });
    expect(document.activeElement).toBe(first);

    first.focus();
    fireEvent.keyDown(dialog(), { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("warms the neighbouring images so a move lands on a decoded one", () => {
    const requested: string[] = [];
    const RealImage = window.Image;
    // jsdom does not fetch, so the assignment is the only observable effect.
    class SpyImage {
      set src(value: string) {
        requested.push(value);
      }
    }
    window.Image = SpyImage as unknown as typeof RealImage;

    try {
      setup({ index: 0 });
    } finally {
      window.Image = RealImage;
    }

    expect(requested).toEqual(["/two.jpg", "/three.jpg"]);
  });

  it("warms nothing for a lone item", () => {
    const requested: string[] = [];
    const RealImage = window.Image;
    class SpyImage {
      set src(value: string) {
        requested.push(value);
      }
    }
    window.Image = SpyImage as unknown as typeof RealImage;

    try {
      setup({ items: [ITEMS[0]!] });
    } finally {
      window.Image = RealImage;
    }

    expect(requested).toEqual([]);
  });

  it("is a modal dialog with a label", () => {
    setup();

    expect(dialog()).toHaveAttribute("aria-modal", "true");
    expect(dialog()).toHaveAccessibleName("Image viewer");
  });

  it("mirrors the page theme onto the portal root so pageBg resolves", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    try {
      setup();

      expect(dialog().closest("[data-theme]")).toHaveAttribute("data-theme", "dark");
    } finally {
      document.documentElement.removeAttribute("data-theme");
    }
  });

  // The frame is portalled onto `document.body`, so these query the document
  // rather than render()'s container.
  it("plays a video item instead of rendering an image", () => {
    setup({ items: [{ src: "/clip.mp4", alt: "A clip", video: { source: "native" } }] });

    expect(document.querySelector("video")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("embeds a video item that names an embed source", () => {
    setup({
      items: [{ src: "https://youtu.be/abcdefghijk", alt: "", video: { source: "youtube" } }],
    });

    expect(document.querySelector("iframe")).toBeInTheDocument();
  });

  it("honours an explicit theme over the page's", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    try {
      setup({ theme: "light" });

      expect(dialog().closest("[data-theme]")).toHaveAttribute("data-theme", "light");
    } finally {
      document.documentElement.removeAttribute("data-theme");
    }
  });
});
