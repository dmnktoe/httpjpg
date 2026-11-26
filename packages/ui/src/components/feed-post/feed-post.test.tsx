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
    expect(screen.queryByRole("button", { name: "Next image" })).toBeNull();
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

  it("puts the author above the frame and before the caption", () => {
    const { container } = render(
      <FeedPost
        images={ONE}
        caption="first light"
        author={{ name: "httpjpg", avatarSrc: "/me.jpg" }}
      />,
    );

    expect(screen.getAllByText("httpjpg")).toHaveLength(2);
    expect(container.querySelector("[data-avatar] img")).toHaveAttribute("src", "/me.jpg");
    expect(screen.getByText(/first light/)).toHaveTextContent("httpjpg first light");
  });

  it("has no author row without an author", () => {
    const { container } = render(<FeedPost images={ONE} caption="first light" />);

    expect(container.querySelector("[data-avatar]")).toBeNull();
    expect(screen.getByText(/first light/)).toHaveTextContent(/^first light$/);
  });

  it("likes and unlikes without telling anyone", () => {
    render(<FeedPost images={ONE} />);
    const like = screen.getByRole("button", { name: "Like" });

    expect(like).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(like);
    expect(like).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(like);
    expect(like).toHaveAttribute("aria-pressed", "false");
  });

  it("says that comments are off when asked for them", () => {
    render(<FeedPost images={ONE} />);
    const comment = screen.getByRole("button", { name: "Comment" });

    expect(screen.queryByRole("status")).toBeNull();
    fireEvent.click(comment);
    expect(screen.getByRole("status")).toHaveTextContent(/comments are off/);
    fireEvent.click(comment);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("marks a post with images and a player, for the grid's tile", () => {
    const { container } = render(
      <FeedPost images={ONE}>
        <span>▸ PLAY</span>
      </FeedPost>,
    );

    expect(container.querySelector("[data-feed-badge]")).toHaveTextContent("♪");
    expect(container.querySelector("[data-feed-tile]")).toBeNull();
  });

  it("gives a post without images a tile that opens it", () => {
    const { container } = render(
      <FeedPost images={[]} href="/feed/a" cover="/artwork.jpg">
        <span>▸ PLAY</span>
      </FeedPost>,
    );
    const tile = container.querySelector("[data-feed-tile]");

    expect(tile).toHaveAttribute("href", "/feed/a");
    expect(tile?.querySelector("img")).toHaveAttribute("src", "/artwork.jpg");
  });

  it("draws notes on the tile when there is no artwork or permalink", () => {
    const { container } = render(
      <FeedPost images={[]}>
        <span>▸ PLAY</span>
      </FeedPost>,
    );
    const tile = container.querySelector("[data-feed-tile]");

    expect(tile).toHaveTextContent("♪ ♫ ♪");
    expect(tile).not.toHaveAttribute("href");
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
      Object.defineProperty(el, "scrollWidth", { configurable: true, value: 902 });
      return el;
    }

    it("counts the images", () => {
      render(<FeedPost images={THREE} />);

      expect(screen.getByText("[ 01 / 03 ]")).toBeInTheDocument();
    });

    it("follows a swipe", () => {
      const { container } = render(<FeedPost images={THREE} />);
      const el = track(container);

      el.scrollLeft = 602;
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
      expect(scrollTo).toHaveBeenLastCalledWith({ left: 301, behavior: "smooth" });
      fireEvent.click(screen.getByRole("button", { name: "Next image" }));
      fireEvent.click(screen.getByRole("button", { name: "Next image" }));

      expect(screen.getByText("[ 03 / 03 ]")).toBeInTheDocument();
      expect(scrollTo).toHaveBeenLastCalledWith({ left: 602, behavior: "smooth" });
    });

    it("marks the current image with a dot", () => {
      const { container } = render(<FeedPost images={THREE} />);
      const dots = () => Array.from(container.querySelectorAll("[data-feed-dots] > *"));
      const el = track(container);

      expect(dots().map((dot) => dot.hasAttribute("data-active"))).toEqual([true, false, false]);

      el.scrollLeft = 301;
      fireEvent.scroll(el);

      expect(dots().map((dot) => dot.hasAttribute("data-active"))).toEqual([false, true, false]);
    });

    it("has no dots for a single image", () => {
      const { container } = render(<FeedPost images={ONE} />);

      expect(container.querySelector("[data-feed-dots]")).toBeNull();
    });

    it("slides to the next image when the mouse drags it far enough", () => {
      const { container } = render(<FeedPost images={THREE} />);
      const el = track(container);
      const scrollTo = vi.fn();
      el.scrollTo = scrollTo;

      fireEvent.pointerDown(el, { pointerType: "mouse", button: 0, clientX: 200 });
      fireEvent.pointerMove(el, { pointerType: "mouse", buttons: 1, clientX: 120 });
      expect(el).toHaveAttribute("data-dragging");
      expect(el.scrollLeft).toBe(80);
      fireEvent.pointerUp(el, { pointerType: "mouse", clientX: 120 });

      expect(el).not.toHaveAttribute("data-dragging");
      expect(scrollTo).toHaveBeenLastCalledWith({ left: 301, behavior: "smooth" });
      expect(screen.getByText("[ 02 / 03 ]")).toBeInTheDocument();
    });

    it("snaps back after a short drag and swallows the click that ends it", () => {
      const onImageClick = vi.fn();
      const { container } = render(<FeedPost images={THREE} onImageClick={onImageClick} />);
      const el = track(container);
      const scrollTo = vi.fn();
      el.scrollTo = scrollTo;

      fireEvent.pointerDown(el, { pointerType: "mouse", button: 0, clientX: 200 });
      fireEvent.pointerMove(el, { pointerType: "mouse", buttons: 1, clientX: 180 });
      fireEvent.pointerUp(el, { pointerType: "mouse", clientX: 180 });
      fireEvent.click(screen.getByRole("button", { name: "Open Ferry at full size" }));

      expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: "smooth" });
      expect(onImageClick).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "Open Ferry at full size" }));
      expect(onImageClick).toHaveBeenCalledWith(2);
    });

    it("lets go when the button was released somewhere else", () => {
      const { container } = render(<FeedPost images={THREE} />);
      const el = track(container);
      const scrollTo = vi.fn();
      el.scrollTo = scrollTo;

      fireEvent.pointerDown(el, { pointerType: "mouse", button: 0, clientX: 200 });
      fireEvent.pointerMove(el, { pointerType: "mouse", buttons: 0, clientX: 60 });

      expect(el).not.toHaveAttribute("data-dragging");
      expect(el.scrollLeft).toBe(0);
      expect(scrollTo).not.toHaveBeenCalled();

      fireEvent.pointerMove(el, { pointerType: "mouse", buttons: 0, clientX: 20 });
      expect(el).not.toHaveAttribute("data-dragging");
    });

    it("returns to where it started when a drag is cancelled", () => {
      const { container } = render(<FeedPost images={THREE} />);
      const el = track(container);
      const scrollTo = vi.fn();
      el.scrollTo = scrollTo;

      fireEvent.pointerDown(el, { pointerType: "mouse", button: 0, clientX: 200 });
      fireEvent.pointerMove(el, { pointerType: "mouse", buttons: 1, clientX: 40 });
      fireEvent.pointerCancel(el, { pointerType: "mouse", clientX: 0 });

      expect(el).not.toHaveAttribute("data-dragging");
      expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: "smooth" });
    });

    it("keeps the browser from dragging a linked image out of the carousel", () => {
      const { container } = render(<FeedPost images={THREE} href="/feed/a" />);

      expect(fireEvent.dragStart(track(container))).toBe(false);
    });

    it("does not drag a track that shows a single slide, as in a grid", () => {
      const { container } = render(<FeedPost images={THREE} />);
      const el = track(container);
      Object.defineProperty(el, "scrollWidth", { configurable: true, value: 300 });

      fireEvent.pointerDown(el, { pointerType: "mouse", button: 0, clientX: 200 });
      fireEvent.pointerMove(el, { pointerType: "mouse", buttons: 1, clientX: 60 });

      expect(el).not.toHaveAttribute("data-dragging");
      expect(el.scrollLeft).toBe(0);
    });

    it("leaves a press without movement, and touch, to the browser", () => {
      const onImageClick = vi.fn();
      const { container } = render(<FeedPost images={THREE} onImageClick={onImageClick} />);
      const el = track(container);

      fireEvent.pointerDown(el, { pointerType: "touch", button: 0, clientX: 200 });
      fireEvent.pointerMove(el, { pointerType: "touch", clientX: 100 });
      expect(el).not.toHaveAttribute("data-dragging");

      fireEvent.pointerDown(el, { pointerType: "mouse", button: 0, clientX: 200 });
      fireEvent.pointerMove(el, { pointerType: "mouse", buttons: 1, clientX: 198 });
      fireEvent.pointerUp(el, { pointerType: "mouse", clientX: 198 });
      fireEvent.click(screen.getByRole("button", { name: "Open Ferry at full size" }));

      expect(onImageClick).toHaveBeenCalledWith(2);
    });
  });

  it("links every image to the post when it has a permalink", () => {
    const onImageClick = vi.fn();
    render(<FeedPost images={THREE} href="/feed/a" onImageClick={onImageClick} />);

    const link = screen.getByRole("link", { name: "Open the post: Ferry" });
    expect(link).toHaveAttribute("href", "/feed/a");
    expect(link).toHaveAttribute("data-cursor", "open post");
    expect(screen.queryByRole("button", { name: /at full size/ })).toBeNull();
  });
});
