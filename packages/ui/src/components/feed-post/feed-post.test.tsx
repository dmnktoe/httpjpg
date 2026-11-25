import { fireEvent, render, screen } from "@testing-library/react";

import { FeedPost, type FeedPostImage } from "./feed-post";

const ONE: FeedPostImage[] = [{ id: "a", src: "/a.jpg", alt: "Harbour at night" }];
const THREE: FeedPostImage[] = [
  { id: "a", src: "/a.jpg", srcSet: "/a-640.jpg 640w", alt: "Harbour at night" },
  { id: "b", src: "/b.jpg", alt: "", fit: "contain" },
  { id: "c", src: "/c.jpg", alt: "Ferry" },
];

function frame(container: HTMLElement): HTMLElement {
  return container.querySelector("[data-feed-frame]") as HTMLElement;
}

describe("FeedPost", () => {
  it("renders nothing without images or a player", () => {
    const { container } = render(<FeedPost images={[]} caption="orphan" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("frames a single image at the post's ratio without carousel chrome", () => {
    const { container } = render(<FeedPost images={ONE} ratio="4/5" />);

    expect(frame(container).style.getPropertyValue("--feed-ratio")).toBe("4/5");
    expect(screen.getByAltText("Harbour at night")).toHaveAttribute("src", "/a.jpg");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("defaults to a square frame", () => {
    const { container } = render(<FeedPost images={ONE} />);

    expect(frame(container).style.getPropertyValue("--feed-ratio")).toBe("1/1");
  });

  it("only sends sizes along with a srcSet", () => {
    render(<FeedPost images={THREE} sizes="50vw" />);

    expect(screen.getByAltText("Harbour at night")).toHaveAttribute("sizes", "50vw");
    expect(screen.getByAltText("Ferry")).not.toHaveAttribute("sizes");
  });

  it("fills by default and fits on request", () => {
    const { container } = render(<FeedPost images={THREE} />);
    const [fill, fit] = Array.from(container.querySelectorAll("img"));

    expect(fill?.className).toContain("jpg-obj-f_cover");
    expect(fit?.className).toContain("jpg-obj-f_contain");
  });

  it("shows the caption, and the date as a permalink", () => {
    render(
      <FeedPost
        images={ONE}
        caption={"first line\nsecond line"}
        date="25 Nov 2026"
        dateTime="2026-11-25T10:00:00.000Z"
        href="/feed/2026-11-25-100000"
      />,
    );

    expect(screen.getByText(/first line/)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "25 Nov 2026" });
    expect(link).toHaveAttribute("href", "/feed/2026-11-25-100000");
    expect(link.querySelector("time")).toHaveAttribute("datetime", "2026-11-25T10:00:00.000Z");
  });

  it("shows a plain date without a permalink", () => {
    render(<FeedPost images={ONE} date="25 Nov 2026" />);

    expect(screen.getByText("25 Nov 2026")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders a player on its own, without a frame", () => {
    const { container } = render(
      <FeedPost images={[]} caption="new mix">
        <span data-testid="player">▸ PLAY</span>
      </FeedPost>,
    );

    expect(screen.getByTestId("player")).toBeInTheDocument();
    expect(frame(container)).toBeNull();
  });

  it("makes each image a button that reports its index", () => {
    const onImageClick = vi.fn();
    render(<FeedPost images={THREE} onImageClick={onImageClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Open Ferry at full size" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Open at full size" })[0] as HTMLElement);

    expect(onImageClick).toHaveBeenNthCalledWith(1, 2);
    expect(onImageClick).toHaveBeenNthCalledWith(2, 1);
  });

  describe("carousel", () => {
    function track(container: HTMLElement): HTMLElement {
      const el = frame(container).firstElementChild as HTMLElement;
      Object.defineProperty(el, "clientWidth", { configurable: true, value: 300 });
      return el;
    }

    it("counts the images", () => {
      render(<FeedPost images={THREE} />);

      expect(screen.getByText("[ 01 / 03 ]")).toBeInTheDocument();
    });

    it("follows a swipe", () => {
      const { container } = render(<FeedPost images={THREE} />);
      const el = track(container);

      el.scrollLeft = 610;
      fireEvent.scroll(el);

      expect(screen.getByText("[ 03 / 03 ]")).toBeInTheDocument();
    });

    it("ignores scroll events before layout", () => {
      const { container } = render(<FeedPost images={THREE} />);
      const el = frame(container).firstElementChild as HTMLElement;

      fireEvent.scroll(el);

      expect(screen.getByText("[ 01 / 03 ]")).toBeInTheDocument();
    });

    it("steps with the buttons and stops at both ends", () => {
      const { container } = render(<FeedPost images={THREE} />);
      const el = track(container);
      const scrollTo = vi.fn();
      el.scrollTo = scrollTo;

      fireEvent.click(screen.getByRole("button", { name: "Previous image" }));
      expect(screen.getByText("[ 01 / 03 ]")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Next image" }));
      expect(scrollTo).toHaveBeenLastCalledWith({ left: 300, behavior: "smooth" });
      fireEvent.click(screen.getByRole("button", { name: "Next image" }));
      fireEvent.click(screen.getByRole("button", { name: "Next image" }));

      expect(screen.getByText("[ 03 / 03 ]")).toBeInTheDocument();
      expect(scrollTo).toHaveBeenLastCalledWith({ left: 600, behavior: "smooth" });
    });
  });
});
