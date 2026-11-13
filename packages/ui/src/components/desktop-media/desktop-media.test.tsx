import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { DesktopMedia } from "./desktop-media";

const ITEMS = [
  { id: "still", name: "Still.png", src: "https://cdn.example/still.png" },
  { id: "reel", name: "Showreel.mp4", src: "https://cdn.example/reel.mp4" },
];

describe("DesktopMedia", () => {
  it("renders nothing when there are no usable items", () => {
    render(<DesktopMedia items={[{ id: "x", name: "", src: "" }]} />);
    expect(screen.queryByRole("region", { name: "Work media" })).toBeNull();
  });

  it("portals one frame per image and video onto document.body", () => {
    const { container } = render(<DesktopMedia items={ITEMS} />);

    expect(container.querySelector("[data-desktop-media]")).toBeNull();
    const layer = screen.getByRole("region", { name: "Work media" });
    expect(layer.parentElement?.parentElement).toBe(document.body);
    expect(layer.className).toContain("md:jpg-d_block");
    expect(layer.className).toContain("jpg-d_none");
    expect(screen.getByRole("figure", { name: "Still.png" })).toHaveAttribute(
      "data-media-kind",
      "image",
    );
    expect(screen.getByRole("figure", { name: "Showreel.mp4" })).toHaveAttribute(
      "data-media-kind",
      "video",
    );
    expect(screen.getByRole("img", { name: "Still.png" })).toHaveAttribute(
      "src",
      "https://cdn.example/still.png",
    );
    expect(document.querySelector("video")).toHaveAttribute("src", "https://cdn.example/reel.mp4");
  });

  it("selects on pointer down and clears selection outside the layer", () => {
    render(<DesktopMedia items={ITEMS} />);
    const frame = screen.getByRole("figure", { name: "Still.png" });

    fireEvent.pointerDown(frame, { button: 0, pointerId: 1, clientX: 20, clientY: 20 });
    expect(frame).toHaveAttribute("data-selected");

    fireEvent.pointerDown(document.body, { button: 0, pointerId: 2 });
    expect(frame).not.toHaveAttribute("data-selected");
  });

  it("drags past the threshold into pixel positioning", () => {
    render(<DesktopMedia items={[ITEMS[0]]} />);
    const frame = screen.getByRole("figure", { name: "Still.png" });

    vi.spyOn(frame, "getBoundingClientRect").mockReturnValue({
      x: 80,
      y: 60,
      left: 80,
      top: 60,
      width: 400,
      height: 300,
      right: 480,
      bottom: 360,
      toJSON() {
        return {};
      },
    });

    fireEvent.pointerDown(frame, { button: 0, pointerId: 1, clientX: 90, clientY: 70 });
    fireEvent.pointerMove(frame, { pointerId: 1, clientX: 140, clientY: 120 });

    expect(frame.style.left).toBe("130px");
    expect(frame.style.top).toBe("110px");

    fireEvent.pointerUp(frame, { pointerId: 1 });
    fireEvent.pointerMove(frame, { pointerId: 1, clientX: 400, clientY: 400 });
    expect(frame.style.left).toBe("130px");
  });

  it("does not drag when the pointer starts on the video player", () => {
    render(<DesktopMedia items={[ITEMS[1]]} />);
    const frame = screen.getByRole("figure", { name: "Showreel.mp4" });
    const player = frame.querySelector("[data-desktop-no-drag]") as HTMLElement;
    const initialLeft = frame.style.left;

    vi.spyOn(frame, "getBoundingClientRect").mockReturnValue({
      x: 80,
      y: 60,
      left: 80,
      top: 60,
      width: 400,
      height: 260,
      right: 480,
      bottom: 320,
      toJSON() {
        return {};
      },
    });

    fireEvent.pointerDown(player, { button: 0, pointerId: 1, clientX: 90, clientY: 120 });
    fireEvent.pointerMove(frame, { pointerId: 1, clientX: 200, clientY: 200 });
    expect(frame.style.left).toBe(initialLeft);
  });

  it("ignores pointer ids that do not own the drag", () => {
    render(<DesktopMedia items={[ITEMS[0]]} />);
    const frame = screen.getByRole("figure", { name: "Still.png" });
    const initialLeft = frame.style.left;

    vi.spyOn(frame, "getBoundingClientRect").mockReturnValue({
      x: 80,
      y: 60,
      left: 80,
      top: 60,
      width: 400,
      height: 300,
      right: 480,
      bottom: 360,
      toJSON() {
        return {};
      },
    });

    fireEvent.pointerDown(frame, { button: 0, pointerId: 1, clientX: 90, clientY: 70 });
    fireEvent.pointerMove(frame, { pointerId: 2, clientX: 400, clientY: 400 });
    fireEvent.pointerUp(frame, { pointerId: 2 });
    expect(frame.style.left).toBe(initialLeft);

    fireEvent.pointerMove(frame, { pointerId: 1, clientX: 140, clientY: 120 });
    expect(frame.style.left).toBe("130px");
    fireEvent.pointerCancel(frame, { pointerId: 1 });
    fireEvent.pointerMove(frame, { pointerId: 1, clientX: 400, clientY: 400 });
    expect(frame.style.left).toBe("130px");
  });

  it("ignores a tiny pointer wiggle so a click still selects", () => {
    render(<DesktopMedia items={[ITEMS[0]]} />);
    const frame = screen.getByRole("figure", { name: "Still.png" });
    const initialLeft = frame.style.left;

    vi.spyOn(frame, "getBoundingClientRect").mockReturnValue({
      x: 40,
      y: 40,
      left: 40,
      top: 40,
      width: 400,
      height: 300,
      right: 440,
      bottom: 340,
      toJSON() {
        return {};
      },
    });

    fireEvent.pointerDown(frame, { button: 0, pointerId: 1, clientX: 50, clientY: 50 });
    fireEvent.pointerMove(frame, { pointerId: 1, clientX: 51, clientY: 51 });

    expect(frame.style.left).toBe(initialLeft);
  });

  it("ignores a non-primary pointer button", () => {
    render(<DesktopMedia items={[ITEMS[0]]} />);
    const frame = screen.getByRole("figure", { name: "Still.png" });

    fireEvent.pointerDown(frame, { button: 1, pointerId: 1, clientX: 20, clientY: 20 });
    expect(frame).not.toHaveAttribute("data-selected");
  });

  it("lets a caller force the media kind", () => {
    render(
      <DesktopMedia
        items={[{ id: "forced", name: "Mystery", src: "https://cdn.example/blob", kind: "image" }]}
      />,
    );
    expect(screen.getByRole("figure", { name: "Mystery" })).toHaveAttribute(
      "data-media-kind",
      "image",
    );
  });

  it("uses the item width for the frame", () => {
    render(
      <DesktopMedia
        items={[{ id: "narrow", name: "Narrow", src: "https://cdn.example/still.png", width: 240 }]}
      />,
    );
    expect(screen.getByRole("figure", { name: "Narrow" })).toHaveAttribute(
      "data-frame-width",
      "240",
    );
    expect(screen.getByRole("figure", { name: "Narrow" }).style.width).toContain("240px");
  });

  it("restates the page theme on the portal root and follows changes", async () => {
    const host = document.createElement("div");
    host.setAttribute("data-theme", "dark");
    document.body.appendChild(host);
    try {
      render(<DesktopMedia items={[ITEMS[0]]} />);
      const mirror = screen.getByRole("region", { name: "Work media" }).parentElement;
      expect(mirror).toHaveAttribute("data-theme-mirror");
      expect(mirror).toHaveAttribute("data-theme", "dark");

      host.setAttribute("data-theme", "light");
      await waitFor(() => expect(mirror).toHaveAttribute("data-theme", "light"));
    } finally {
      host.remove();
    }
  });

  it("limits touch-action to the title bar so swipes on the media still scroll", () => {
    render(<DesktopMedia items={[ITEMS[0]]} />);
    const frame = screen.getByRole("figure", { name: "Still.png" });
    const titlebar = frame.querySelector("[data-desktop-titlebar]") as HTMLElement;

    expect(frame.className).not.toContain("tch-a");
    expect(titlebar.className).toContain("jpg-tch-a_none");
  });

  it("narrows the window instead of cropping tall media", () => {
    render(
      <DesktopMedia
        items={[
          {
            id: "tall",
            name: "Tall.mp4",
            src: "https://cdn.example/tall.mp4",
            mediaWidth: 1080,
            mediaHeight: 1920,
          },
        ]}
      />,
    );
    const frame = screen.getByRole("figure", { name: "Tall.mp4" });

    // jsdom re-serialises calc(), so match the terms rather than the exact string.
    expect(frame.style.width).toMatch(/^min\(400px, .*0\.5625 \* \(min\(72vh, 800px\)/);
    expect(frame.style.maxHeight).toBe("");
    expect(frame.style.top).toContain("0.5625");
    expect((frame.lastElementChild as HTMLElement).style.aspectRatio).toBe("1080/1920");
  });

  it("lets a video of unknown size lay itself out and letterboxes it at the cap", () => {
    render(<DesktopMedia items={[ITEMS[1]]} />);
    const frame = screen.getByRole("figure", { name: "Showreel.mp4" });
    const video = frame.querySelector("video") as HTMLVideoElement;

    expect((frame.lastElementChild as HTMLElement).style.aspectRatio).toBe("");
    expect(video.style.maxHeight).toContain("72vh");
    expect(frame.style.top).toMatch(
      /^clamp\(8px, [\d.]+%, \(100vh - 8px\) - min\(72vh, 800px\)\)$/,
    );
  });
});
