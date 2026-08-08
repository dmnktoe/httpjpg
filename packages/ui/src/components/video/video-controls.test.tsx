import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { VideoControls } from "./video-controls";

function setup({ show = true }: { show?: boolean } = {}) {
  const video = document.createElement("video");
  video.play = vi.fn();
  video.pause = vi.fn();
  // jsdom's HTMLMediaElement ignores currentTime writes; make it observable.
  Object.defineProperty(video, "currentTime", { value: 0, writable: true, configurable: true });
  document.body.appendChild(video);

  const ref = createRef<HTMLVideoElement>();
  (ref as { current: HTMLVideoElement | null }).current = video;

  const utils = render(<VideoControls videoRef={ref} show={show} />);
  return { video, ref, ...utils };
}

describe("VideoControls", () => {
  it("renders nothing when show is false", () => {
    const { container } = setup({ show: false });

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a seek slider and a volume slider", () => {
    setup();

    expect(screen.getByLabelText("Seek")).toBeInTheDocument();
    expect(screen.getByLabelText("Volume")).toBeInTheDocument();
  });

  it("survives a missing video element", () => {
    const ref = createRef<HTMLVideoElement>();

    expect(() => render(<VideoControls videoRef={ref} />)).not.toThrow();
    fireEvent.click(screen.getByLabelText("Play"));
    fireEvent.click(screen.getByLabelText("Mute"));
    fireEvent.change(screen.getByLabelText("Seek"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("Volume"), { target: { value: "0.5" } });
  });

  it("plays the video and flips the button label on the play event", () => {
    const { video } = setup();

    fireEvent.click(screen.getByLabelText("Play"));
    expect(video.play).toHaveBeenCalledOnce();

    act(() => {
      video.dispatchEvent(new Event("play"));
    });
    expect(screen.getByLabelText("Pause")).toBeInTheDocument();
  });

  it("pauses the video while it is playing", () => {
    const { video } = setup();

    act(() => {
      video.dispatchEvent(new Event("play"));
    });
    fireEvent.click(screen.getByLabelText("Pause"));
    expect(video.pause).toHaveBeenCalledOnce();

    act(() => {
      video.dispatchEvent(new Event("pause"));
    });
    expect(screen.getByLabelText("Play")).toBeInTheDocument();
  });

  it("toggles mute in both directions", () => {
    const { video } = setup();

    fireEvent.click(screen.getByLabelText("Mute"));
    expect(video.muted).toBe(true);

    act(() => {
      video.dispatchEvent(new Event("volumechange"));
    });
    expect(screen.getByLabelText("Unmute")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Unmute"));
    expect(video.muted).toBe(false);
  });

  it("seeks the video and moves the slider", () => {
    const { video } = setup();

    Object.defineProperty(video, "duration", { value: 60, configurable: true });
    act(() => {
      video.dispatchEvent(new Event("durationchange"));
    });

    fireEvent.change(screen.getByLabelText("Seek"), { target: { value: "12" } });

    expect(video.currentTime).toBe(12);
    expect(screen.getByLabelText("Seek")).toHaveValue("12");
  });

  it("tracks the current time and duration reported by the video", () => {
    const { video } = setup();

    Object.defineProperty(video, "duration", { value: 125, configurable: true });
    Object.defineProperty(video, "currentTime", { value: 65, writable: true });

    act(() => {
      video.dispatchEvent(new Event("durationchange"));
      video.dispatchEvent(new Event("timeupdate"));
    });

    expect(screen.getByText(/1:05/)).toHaveTextContent("2:05");
  });

  it("renders 0:00 for a non-finite duration", () => {
    const { video } = setup();

    Object.defineProperty(video, "duration", { value: Number.NaN, configurable: true });
    act(() => {
      video.dispatchEvent(new Event("durationchange"));
    });

    expect(screen.getByText(/0:00 ⋄ 0:00/)).toBeInTheDocument();
  });

  it("mutes the video when the volume slider reaches zero", () => {
    const { video } = setup();

    fireEvent.change(screen.getByLabelText("Volume"), { target: { value: "0" } });

    expect(video.volume).toBe(0);
    expect(video.muted).toBe(true);
  });

  it("unmutes the video when the volume is raised again", () => {
    const { video } = setup();

    video.muted = true;
    act(() => {
      video.dispatchEvent(new Event("volumechange"));
    });

    fireEvent.change(screen.getByLabelText("Volume"), { target: { value: "0.4" } });

    expect(video.volume).toBeCloseTo(0.4);
    expect(video.muted).toBe(false);
  });

  it("pins the volume slider to zero while muted", () => {
    const { video } = setup();

    video.muted = true;
    act(() => {
      video.dispatchEvent(new Event("volumechange"));
    });

    expect(screen.getByLabelText("Volume")).toHaveValue("0");
  });

  it("reveals itself on hover and hides again on leave", () => {
    setup();
    const bar = screen.getByLabelText("Seek").parentElement as HTMLElement;

    fireEvent.mouseEnter(bar);
    expect(bar).toHaveStyle({ opacity: "1" });

    fireEvent.mouseLeave(bar);
    expect(bar).toHaveStyle({ opacity: "0" });
  });

  it("detaches its listeners on unmount", () => {
    const { video, unmount } = setup();
    const removeEventListener = vi.spyOn(video, "removeEventListener");

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("timeupdate", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("volumechange", expect.any(Function));
  });
});
