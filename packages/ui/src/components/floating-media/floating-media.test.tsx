import { fireEvent, render, screen } from "@testing-library/react";

import { FloatingMedia } from "./floating-media";

const ITEMS = [
  { id: "still", name: "Still.png", src: "https://cdn.example/still.png" },
  { id: "reel", name: "Showreel.mp4", src: "https://cdn.example/reel.mp4" },
];

describe("FloatingMedia", () => {
  it("renders nothing when there are no usable items", () => {
    render(<FloatingMedia items={[{ id: "x", name: "", src: "" }]} />);
    expect(screen.queryByRole("region", { name: "Work media" })).toBeNull();
  });

  it("portals one frame per image and video onto document.body", () => {
    const { container } = render(<FloatingMedia items={ITEMS} />);

    expect(container.querySelector("[data-floating-media]")).toBeNull();
    expect(screen.getByRole("region", { name: "Work media" }).parentElement).toBe(document.body);
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
    render(<FloatingMedia items={ITEMS} />);
    const frame = screen.getByRole("figure", { name: "Still.png" });

    fireEvent.pointerDown(frame, { button: 0, pointerId: 1, clientX: 20, clientY: 20 });
    expect(frame).toHaveAttribute("data-selected");

    fireEvent.pointerDown(document.body, { button: 0, pointerId: 2 });
    expect(frame).not.toHaveAttribute("data-selected");
  });

  it("drags past the threshold into pixel positioning", () => {
    render(<FloatingMedia items={[ITEMS[0]]} />);
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
    render(<FloatingMedia items={[ITEMS[1]]} />);
    const frame = screen.getByRole("figure", { name: "Showreel.mp4" });
    const player = frame.querySelector("[data-floating-no-drag]") as HTMLElement;
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
    render(<FloatingMedia items={[ITEMS[0]]} />);
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
    render(<FloatingMedia items={[ITEMS[0]]} />);
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
    render(<FloatingMedia items={[ITEMS[0]]} />);
    const frame = screen.getByRole("figure", { name: "Still.png" });

    fireEvent.pointerDown(frame, { button: 1, pointerId: 1, clientX: 20, clientY: 20 });
    expect(frame).not.toHaveAttribute("data-selected");
  });

  it("lets a caller force the media kind", () => {
    render(
      <FloatingMedia
        items={[{ id: "forced", name: "Mystery", src: "https://cdn.example/blob", kind: "image" }]}
      />,
    );
    expect(screen.getByRole("figure", { name: "Mystery" })).toHaveAttribute(
      "data-media-kind",
      "image",
    );
  });
});
