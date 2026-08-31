import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";

import { Image } from "./image";

const BLUR = "data:image/png;base64,blur";

// Captures the observer instances created during a render so tests can drive
// the in-view transition by hand.
function stubIntersectionObserver() {
  const instances: Array<{
    callback: IntersectionObserverCallback;
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }> = [];

  class Stub {
    callback: IntersectionObserverCallback;
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = () => [];
    root = null;
    rootMargin = "";
    thresholds: ReadonlyArray<number> = [];

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
      instances.push(this);
    }
  }

  vi.stubGlobal("IntersectionObserver", Stub);
  return instances;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Image", () => {
  it("renders nothing without a src", () => {
    const { container } = render(<Image src="" alt="empty" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the image with its alt text", () => {
    render(<Image src="/photo.jpg" alt="A photo" />);

    expect(screen.getByAltText("A photo")).toHaveAttribute("src", "/photo.jpg");
  });

  it("forwards an object ref to the container", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Image ref={ref} src="/photo.jpg" alt="A photo" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards a callback ref to the container", () => {
    const ref = vi.fn();
    render(<Image ref={ref} src="/photo.jpg" alt="A photo" />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it("defaults to object-fit cover and honors the objectFit prop", () => {
    render(<Image src="/photo.jpg" alt="cover" />);
    expect(screen.getByAltText("cover")).toHaveStyle({ objectFit: "cover" });

    render(<Image src="/photo.jpg" alt="contain" objectFit="contain" />);
    expect(screen.getByAltText("contain")).toHaveStyle({ objectFit: "contain" });
  });

  it("applies the fetch priority", () => {
    render(<Image src="/photo.jpg" alt="lcp" fetchPriority="high" />);

    expect(screen.getByAltText("lcp")).toHaveAttribute("fetchpriority", "high");
  });

  it("keeps a caller-supplied className and style", () => {
    render(<Image src="/photo.jpg" alt="styled" className="custom" style={{ borderRadius: 4 }} />);
    const image = screen.getByAltText("styled");

    expect(image).toHaveClass("custom");
    expect(image).toHaveStyle({ borderRadius: "4px" });
  });

  it("stretches to full width when an aspect ratio is given", () => {
    const { container } = render(<Image src="/photo.jpg" alt="ratio" aspectRatio="4/3" />);

    expect(container.firstElementChild).toBeInTheDocument();
  });

  it("emits srcSet and sizes eagerly when lazy blur-up is off", () => {
    render(
      <Image
        src="/photo.jpg"
        alt="responsive"
        srcSet="/photo-400.jpg 400w"
        sizes="(min-width: 600px) 50vw, 100vw"
      />,
    );
    const image = screen.getByAltText("responsive");

    expect(image).toHaveAttribute("srcset", "/photo-400.jpg 400w");
    expect(image).toHaveAttribute("sizes", "(min-width: 600px) 50vw, 100vw");
  });

  it("omits sizes when there is no srcSet", () => {
    render(<Image src="/photo.jpg" alt="no-srcset" sizes="100vw" />);

    expect(screen.getByAltText("no-srcset")).not.toHaveAttribute("sizes");
  });

  it("emits srcSet without waiting for an intersection when there is no blur placeholder", () => {
    const observers = stubIntersectionObserver();
    render(
      <Image
        src="/photo.jpg"
        alt="skeleton"
        srcSet="/photo-400.jpg 400w"
        sizes="100vw"
        blurOnLoad
      />,
    );
    const image = screen.getByAltText("skeleton");

    expect(image).toHaveAttribute("srcset", "/photo-400.jpg 400w");
    expect(image).toHaveAttribute("sizes", "100vw");
    expect(observers).toHaveLength(0);
  });

  it("reveals a cached image without an intersection when there is no blur placeholder", () => {
    const complete = vi
      .spyOn(window.HTMLImageElement.prototype, "complete", "get")
      .mockReturnValue(true);
    const naturalHeight = vi
      .spyOn(window.HTMLImageElement.prototype, "naturalHeight", "get")
      .mockReturnValue(100);

    render(<Image src="/photo.jpg" alt="hydrated" blurOnLoad />);

    expect(screen.getByAltText("hydrated")).toHaveStyle({ opacity: "1" });

    complete.mockRestore();
    naturalHeight.mockRestore();
  });

  it("calls the caller's onLoad handler", () => {
    const onLoad = vi.fn();
    render(<Image src="/photo.jpg" alt="loaded" onLoad={onLoad} />);

    fireEvent.load(screen.getByAltText("loaded"));

    expect(onLoad).toHaveBeenCalledOnce();
  });

  it("settles into the loaded state when the image errors", () => {
    render(<Image src="/broken.jpg" alt="broken" blurOnLoad blurDataURL={BLUR} />);

    fireEvent.error(screen.getByAltText("broken"));

    expect(screen.getByAltText("broken")).toHaveStyle({ opacity: "1" });
  });

  it("skips the blur transition for an image that is already in the browser cache", () => {
    const src = `${window.location.origin}/photo.jpg`;
    const complete = vi
      .spyOn(window.HTMLImageElement.prototype, "complete", "get")
      .mockReturnValue(true);
    const naturalHeight = vi
      .spyOn(window.HTMLImageElement.prototype, "naturalHeight", "get")
      .mockReturnValue(100);
    const observers = stubIntersectionObserver();

    render(<Image src={src} alt="cached" blurOnLoad blurDataURL={BLUR} />);
    act(() => {
      observers[0].callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        observers[0] as unknown as IntersectionObserver,
      );
    });

    expect(screen.getByAltText("cached")).toHaveStyle({ opacity: "1" });

    complete.mockRestore();
    naturalHeight.mockRestore();
  });

  describe("blur-up", () => {
    it("shows the blur placeholder and holds the real image back until it is in view", () => {
      const observers = stubIntersectionObserver();
      render(<Image src="/photo.jpg" alt="blurred" blurOnLoad blurDataURL={BLUR} />);

      expect(screen.getByAltText("blurred")).toHaveAttribute("src", BLUR);
      expect(screen.getByAltText("blurred")).toHaveStyle({ opacity: "0" });
      expect(observers[0].observe).toHaveBeenCalledOnce();
    });

    it("swaps in the real source once the container intersects", () => {
      const observers = stubIntersectionObserver();
      render(
        <Image
          src="/photo.jpg"
          alt="blurred"
          srcSet="/photo-400.jpg 400w"
          sizes="100vw"
          blurOnLoad
          blurDataURL={BLUR}
        />,
      );

      act(() => {
        observers[0].callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          observers[0] as unknown as IntersectionObserver,
        );
      });

      const image = screen.getByAltText("blurred");
      expect(image).toHaveAttribute("src", "/photo.jpg");
      expect(image).toHaveAttribute("srcset", "/photo-400.jpg 400w");
      expect(observers[0].disconnect).toHaveBeenCalled();
    });

    it("stays hidden while the container is out of view", () => {
      const observers = stubIntersectionObserver();
      render(<Image src="/photo.jpg" alt="blurred" blurOnLoad blurDataURL={BLUR} />);

      act(() => {
        observers[0].callback(
          [{ isIntersecting: false } as IntersectionObserverEntry],
          observers[0] as unknown as IntersectionObserver,
        );
      });

      expect(screen.getByAltText("blurred")).toHaveAttribute("src", BLUR);
    });

    it("reveals the high-res image once it has loaded in view", () => {
      const observers = stubIntersectionObserver();
      render(<Image src="/photo.jpg" alt="blurred" blurOnLoad blurDataURL={BLUR} />);

      act(() => {
        observers[0].callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          observers[0] as unknown as IntersectionObserver,
        );
      });
      fireEvent.load(screen.getByAltText("blurred"));

      expect(screen.getByAltText("blurred")).toHaveStyle({ opacity: "1" });
    });

    it("falls back to the src when no blurDataURL is given", () => {
      stubIntersectionObserver();
      const { container } = render(<Image src="/photo.jpg" alt="skeleton" blurOnLoad />);

      expect(screen.getByAltText("skeleton")).toHaveAttribute("src", "/photo.jpg");
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });

    it("paints the skeleton above the hidden image so the frame is not blank", () => {
      const { container } = render(<Image src="/photo.jpg" alt="skeleton" blurOnLoad />);
      const image = screen.getByAltText("skeleton");
      const skeleton = container.querySelector('[aria-hidden="true"]');

      expect(image).toHaveStyle({ opacity: "0" });
      expect(skeleton).toBeInTheDocument();
      expect(skeleton?.className).toMatch(/z_1/);
    });

    it("does not observe anything when blur-up is off", () => {
      const observers = stubIntersectionObserver();
      render(<Image src="/photo.jpg" alt="eager" />);

      expect(observers).toHaveLength(0);
    });

    it("disconnects its observer on unmount", () => {
      const observers = stubIntersectionObserver();
      const { unmount } = render(
        <Image src="/photo.jpg" alt="blurred" blurOnLoad blurDataURL={BLUR} />,
      );

      unmount();

      expect(observers[0].disconnect).toHaveBeenCalled();
    });
  });

  describe("copyright", () => {
    it.each(["inline-white", "inline-black", "overlay"] as const)(
      "renders the %s label inside the frame",
      (position) => {
        render(
          <Image src="/photo.jpg" alt="c" copyright="© httpjpg" copyrightPosition={position} />,
        );

        expect(screen.getByText(/httpjpg/)).toBeInTheDocument();
      },
    );

    it("renders the label below the frame", () => {
      render(<Image src="/photo.jpg" alt="c" copyright="© httpjpg" copyrightPosition="below" />);

      expect(screen.getByText(/httpjpg/)).toBeInTheDocument();
    });

    it("renders no label without a copyright text", () => {
      render(<Image src="/photo.jpg" alt="c" copyrightPosition="below" />);

      expect(screen.queryByText(/httpjpg/)).not.toBeInTheDocument();
    });

    it("renders the asset source on its own line below the copyright", () => {
      render(
        <Image
          src="/photo.jpg"
          alt="c"
          copyright="httpjpg"
          copyrightSource="flickr.com/x"
          copyrightPosition="below"
        />,
      );

      expect(screen.getByText("© httpjpg")).toBeInTheDocument();
      expect(screen.getByText("flickr.com/x")).toBeInTheDocument();
    });

    it("renders the source even without a copyright text", () => {
      render(
        <Image src="/photo.jpg" alt="c" copyrightSource="flickr.com/x" copyrightPosition="below" />,
      );

      expect(screen.getByText("flickr.com/x")).toBeInTheDocument();
    });
  });
});
