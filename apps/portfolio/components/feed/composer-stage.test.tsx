import { fireEvent, render, screen } from "@testing-library/react";

import { type ComposerMedia, newMedia } from "@/lib/feed/compose/media";

import { ComposerStage } from "./composer-stage";

function picture(patch: Partial<ComposerMedia> = {}): ComposerMedia {
  return {
    ...newMedia(new File(["x"], "a.jpg", { type: "image/jpeg" }), "a", "blob:a"),
    width: 4000,
    height: 2000,
    alt: "harbour",
    ...patch,
  };
}

function stage(container: HTMLElement): HTMLElement {
  const element = container.querySelector("[data-composer-stage]") as HTMLElement;
  element.getBoundingClientRect = () => ({ width: 400, height: 400 }) as DOMRect;
  return element;
}

describe("ComposerStage", () => {
  it("invites files while it is empty", () => {
    const { container } = render(
      <ComposerStage media={undefined} first={undefined} format="4/5" onPan={vi.fn()} />,
    );

    expect(screen.getByText(/drop pictures or videos here/)).toBeInTheDocument();
    expect(stage(container).style.getPropertyValue("--stage-ratio")).toBe("0.8");
  });

  it("lays a new picture out by its crop and lets it be dragged", () => {
    const onPan = vi.fn();
    const media = picture();
    const { container } = render(
      <ComposerStage media={media} first={media} format="1/1" onPan={onPan} />,
    );
    const element = stage(container);

    expect(element).toHaveAttribute("data-movable");
    expect(screen.getByAltText("harbour").style.width).toBe("200%");

    fireEvent.pointerDown(element, { button: 0, clientX: 200, clientY: 100 });
    fireEvent.pointerMove(element, { buttons: 1, clientX: 300, clientY: 100 });

    expect(onPan).toHaveBeenLastCalledWith({ offsetX: -0.5, offsetY: 0 });

    fireEvent.pointerUp(element);
    fireEvent.pointerMove(element, { buttons: 1, clientX: 380, clientY: 100 });
    expect(onPan).toHaveBeenCalledTimes(1);
  });

  it("lets go when the button was released elsewhere", () => {
    const onPan = vi.fn();
    const media = picture();
    const { container } = render(
      <ComposerStage media={media} first={media} format="1/1" onPan={onPan} />,
    );
    const element = stage(container);

    fireEvent.pointerDown(element, { button: 0, clientX: 200, clientY: 100 });
    fireEvent.pointerMove(element, { buttons: 0, clientX: 300, clientY: 100 });
    fireEvent.pointerMove(element, { buttons: 1, clientX: 320, clientY: 100 });

    expect(onPan).not.toHaveBeenCalled();
  });

  it("does not move a fitted picture, a file the post already has or anything in an original frame", () => {
    const onPan = vi.fn();
    const cases: Array<[ComposerMedia, string]> = [
      [picture({ fit: "contain" }), "1/1"],
      [picture({ file: undefined, uid: "u1" }), "1/1"],
      [picture(), "original"],
    ];
    for (const [media, format] of cases) {
      const { container, unmount } = render(
        <ComposerStage media={media} first={media} format={format} onPan={onPan} />,
      );
      const element = stage(container);

      expect(element).not.toHaveAttribute("data-movable");
      fireEvent.pointerDown(element, { button: 0, clientX: 200, clientY: 100 });
      fireEvent.pointerMove(element, { buttons: 1, clientX: 300, clientY: 100 });
      unmount();
    }

    expect(onPan).not.toHaveBeenCalled();
  });

  it("plays a video in the frame", () => {
    const media = picture({ kind: "video" });
    const { container } = render(
      <ComposerStage media={media} first={media} format="1/1" onPan={vi.fn()} />,
    );

    expect(container.querySelector("video")).toHaveAttribute("src", "blob:a");
  });
});
