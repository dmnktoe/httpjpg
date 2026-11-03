import { act, fireEvent, render, screen } from "@testing-library/react";

import { HoloCard } from "./holo-card";

const { mockReducedMotion, mockCreateRenderer } = vi.hoisted(() => ({
  mockReducedMotion: vi.fn<() => boolean | null>(),
  mockCreateRenderer: vi.fn(),
}));

vi.mock("motion/react", () => ({ useReducedMotion: () => mockReducedMotion() }));
vi.mock("./holo-shader", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./holo-shader")>();
  return { ...actual, createHoloRenderer: mockCreateRenderer };
});

interface FakeImage {
  src: string;
  crossOrigin: string;
  decoding: string;
  naturalWidth: number;
  naturalHeight: number;
  onload: (() => void) | null;
  onerror: (() => void) | null;
}

let images: FakeImage[] = [];
let observerCallback: ((entries: Array<{ isIntersecting: boolean }>) => void) | null = null;

function fakeRenderer() {
  return {
    setImage: vi.fn(),
    setLayer: vi.fn(),
    resize: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
  };
}

let pendingFrames: FrameRequestCallback[] = [];

// The tilt loop re-arms rAF every frame, so frames are queued and flushed by
// hand instead of run synchronously (which would recurse forever).
function stubRaf() {
  pendingFrames = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    pendingFrames.push(cb);
    return pendingFrames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
}

function flushFrames(count = 1) {
  for (let i = 0; i < count; i++) {
    const frames = pendingFrames;
    pendingFrames = [];
    for (const frame of frames) {
      frame(16 * (i + 1));
    }
  }
}

beforeEach(() => {
  images = [];
  observerCallback = null;
  mockReducedMotion.mockReturnValue(false);
  mockCreateRenderer.mockImplementation(() => fakeRenderer());
  vi.stubGlobal(
    "Image",
    class {
      src = "";
      crossOrigin = "";
      decoding = "";
      naturalWidth = 10;
      naturalHeight = 10;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor() {
        images.push(this);
      }
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
        observerCallback = cb;
      }
      observe() {}
      disconnect() {}
    },
  );
  stubRaf();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

// Desktop Chromium exposes requestPermission too; the tap is only offered on touch screens.
function stubCoarsePointer(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  );
}

function loadTexture() {
  act(() => {
    images.at(-1)?.onload?.();
  });
}

describe("HoloCard", () => {
  it("renders the image, defers the foil until the texture is decoded", () => {
    const { container } = render(<HoloCard src="/card.jpg" alt="Galagladi ex" />);
    const img = screen.getByRole("img", { name: "Galagladi ex" });
    expect(img).toHaveAttribute("src", "/card.jpg");
    expect(container.firstChild).toHaveAttribute("data-holo-ready", "false");
    expect(images.at(-1)?.crossOrigin).toBe("anonymous");

    loadTexture();
    expect(container.firstChild).toHaveAttribute("data-holo-ready", "true");
    expect(container.querySelector("canvas")).toHaveStyle({ visibility: "visible" });
  });

  it("creates the renderer with a seed from the source and disposes on unmount", () => {
    const { unmount } = render(
      <HoloCard src="/disc.jpg" alt="" variant="disc" intensity={0.5} maxTilt={10} />,
    );
    expect(mockCreateRenderer).toHaveBeenCalledWith(
      expect.any(HTMLCanvasElement),
      expect.objectContaining({ variant: "disc", intensity: 0.5, maxTilt: 10 }),
    );
    const renderer = mockCreateRenderer.mock.results[0]?.value as ReturnType<typeof fakeRenderer>;
    expect(renderer.resize).toHaveBeenCalled();
    unmount();
    expect(renderer.dispose).toHaveBeenCalled();
  });

  it("decodes the texture from textureSrc while the img keeps src", () => {
    const { container } = render(
      <HoloCard src="/card.jpg" textureSrc="/_next/image?url=%2Fcard.jpg&w=1200" alt="" />,
    );
    expect(container.querySelector("img")).toHaveAttribute("src", "/card.jpg");
    expect(images.map((image) => image.src)).toEqual(["/_next/image?url=%2Fcard.jpg&w=1200"]);
  });

  it("loads the optional layers into the renderer", () => {
    render(
      <HoloCard
        src="/card.jpg"
        alt=""
        foregroundSrc="/card-fg.png"
        effectsSrc="/card-fx.png"
        depthSrc="/card-depth.png"
        depth={2}
        foil="swirl"
        sparkle="fireworks"
      />,
    );
    expect(mockCreateRenderer).toHaveBeenCalledWith(
      expect.any(HTMLCanvasElement),
      expect.objectContaining({
        depth: 2,
        overscan: expect.any(Number),
        foil: "swirl",
        sparkle: "fireworks",
      }),
    );
    expect(images.map((image) => image.src)).toEqual([
      "/card.jpg",
      "/card-fg.png",
      "/card-fx.png",
      "/card-depth.png",
    ]);
    const renderer = mockCreateRenderer.mock.results[0]?.value as ReturnType<typeof fakeRenderer>;
    act(() => {
      images[1]?.onload?.();
      images[2]?.onload?.();
      images[3]?.onload?.();
    });
    expect(renderer.setLayer).toHaveBeenCalledWith("foreground", images[1]);
    expect(renderer.setLayer).toHaveBeenCalledWith("effects", images[2]);
    expect(renderer.setLayer).toHaveBeenCalledWith("depth", images[3]);
  });

  it("keeps the plain image when WebGL is unavailable", () => {
    mockCreateRenderer.mockReturnValue(null);
    const { container } = render(<HoloCard src="/card.jpg" alt="Plain" />);
    expect(images).toHaveLength(0);
    expect(container.firstChild).toHaveAttribute("data-holo-ready", "false");
    expect(screen.getByRole("img", { name: "Plain" })).toBeVisible();
  });

  it("falls back when the shader throws", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockCreateRenderer.mockImplementation(() => {
      throw new Error("no shader");
    });
    render(<HoloCard src="/card.jpg" alt="Plain" />);
    expect(warn).toHaveBeenCalled();
    expect(images).toHaveLength(0);
    warn.mockRestore();
  });

  it("repaints the foil from pointer moves once in view", () => {
    const { container } = render(<HoloCard src="/card.jpg" alt="" />);
    loadTexture();
    const renderer = mockCreateRenderer.mock.results[0]?.value as ReturnType<typeof fakeRenderer>;
    const rotator = container.querySelector("canvas")?.parentElement as HTMLElement;
    rotator.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 300, right: 200, bottom: 300 }) as DOMRect;

    act(() => observerCallback?.([{ isIntersecting: true }]));
    renderer.render.mockClear();
    act(() => {
      fireEvent.pointerMove(rotator, { clientX: 200, clientY: 0 });
      flushFrames(3);
    });
    expect(renderer.render).toHaveBeenCalled();
    expect(Number(rotator.style.getPropertyValue("--holo-ry"))).toBeGreaterThan(0);
    expect(Number(rotator.style.getPropertyValue("--holo-rx"))).toBeGreaterThan(0);
  });

  it("holds the pose after the pointer leaves, then eases back slowly", () => {
    // Only the release timer is faked; rAF stays on the hand-flushed queue above.
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      const { container } = render(<HoloCard src="/card.jpg" alt="" idle={false} />);
      const rotator = container.querySelector("canvas")?.parentElement as HTMLElement;
      rotator.getBoundingClientRect = () =>
        ({ left: 0, top: 0, width: 200, height: 300, right: 200, bottom: 300 }) as DOMRect;
      act(() => observerCallback?.([{ isIntersecting: true }]));
      act(() => {
        fireEvent.pointerMove(rotator, { clientX: 200, clientY: 150 });
        flushFrames(80);
      });
      const tilted = Number(rotator.style.getPropertyValue("--holo-ry"));
      expect(tilted).toBeGreaterThan(17);

      act(() => {
        fireEvent.pointerLeave(rotator);
        vi.advanceTimersByTime(200);
        flushFrames(10);
      });
      expect(Number(rotator.style.getPropertyValue("--holo-ry"))).toBeCloseTo(tilted, 1);

      act(() => {
        vi.advanceTimersByTime(200);
        flushFrames(10);
      });
      const returning = Number(rotator.style.getPropertyValue("--holo-ry"));
      expect(returning).toBeLessThan(tilted);
      expect(returning).toBeGreaterThan(tilted * 0.4);

      act(() => {
        flushFrames(200);
      });
      expect(Number(rotator.style.getPropertyValue("--holo-ry"))).toBeCloseTo(0, 1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("stays at rest under reduced motion", () => {
    mockReducedMotion.mockReturnValue(true);
    const { container } = render(<HoloCard src="/card.jpg" alt="" idle />);
    const rotator = container.querySelector("canvas")?.parentElement as HTMLElement;
    expect(rotator.style.getPropertyValue("--holo-active")).toBe("0.000");
    act(() => {
      fireEvent.pointerMove(rotator, { clientX: 50, clientY: 50 });
    });
    expect(rotator.style.getPropertyValue("--holo-rx")).toBe("0.00");
  });

  it("offers a tap to unlock the gyroscope where the browser gates it", async () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    vi.stubGlobal("DeviceOrientationEvent", { requestPermission });
    stubCoarsePointer(true);
    render(<HoloCard src="/card.jpg" alt="" />);
    const hint = await screen.findByRole("button", { name: "[ tap to tilt ]" });
    await act(async () => {
      fireEvent.click(hint);
    });
    expect(requestPermission).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "[ tap to tilt ]" })).not.toBeInTheDocument();
  });

  it("hides the hint when the gyroscope is off or denied", async () => {
    const requestPermission = vi.fn().mockRejectedValue(new Error("nope"));
    vi.stubGlobal("DeviceOrientationEvent", { requestPermission });
    stubCoarsePointer(true);
    const { rerender } = render(<HoloCard src="/card.jpg" alt="" />);
    const hint = await screen.findByRole("button", { name: "[ tap to tilt ]" });
    await act(async () => {
      fireEvent.click(hint);
    });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(<HoloCard src="/card.jpg" alt="" gyro={false} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("follows the gyroscope relative to the first reading once in view", () => {
    vi.stubGlobal("DeviceOrientationEvent", {});
    const { container } = render(<HoloCard src="/card.jpg" alt="" idle={false} />);
    const rotator = container.querySelector("canvas")?.parentElement as HTMLElement;
    act(() => observerCallback?.([{ isIntersecting: true }]));

    const orient = (beta: number, gamma: number) => {
      const event = new Event("deviceorientation");
      Object.defineProperty(event, "beta", { value: beta });
      Object.defineProperty(event, "gamma", { value: gamma });
      window.dispatchEvent(event);
    };

    act(() => {
      orient(40, 5);
      flushFrames(30);
    });
    expect(Number(rotator.style.getPropertyValue("--holo-ry"))).toBeCloseTo(0, 1);

    act(() => {
      orient(40, 29);
      flushFrames(60);
    });
    expect(Number(rotator.style.getPropertyValue("--holo-ry"))).toBeGreaterThan(10);
    expect(Number(rotator.style.getPropertyValue("--holo-active"))).toBeGreaterThan(0.9);

    act(() => {
      const nullEvent = new Event("deviceorientation");
      Object.defineProperty(nullEvent, "beta", { value: null });
      Object.defineProperty(nullEvent, "gamma", { value: null });
      window.dispatchEvent(nullEvent);
      flushFrames(5);
    });
    expect(Number(rotator.style.getPropertyValue("--holo-ry"))).toBeGreaterThan(10);
  });

  it("keeps the gyroscope tap off mouse-driven devices", () => {
    vi.stubGlobal("DeviceOrientationEvent", { requestPermission: vi.fn() });
    stubCoarsePointer(false);
    render(<HoloCard src="/card.jpg" alt="" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders credit below the card and a children slot", () => {
    render(
      <HoloCard src="/card.jpg" alt="" copyright="Studio XYZ" copyrightSource="Film">
        <p>Caption</p>
      </HoloCard>,
    );
    expect(screen.getByText(/Studio XYZ/)).toBeInTheDocument();
    expect(screen.getByText("Film")).toBeInTheDocument();
    expect(screen.getByText("Caption")).toBeInTheDocument();
  });
});
