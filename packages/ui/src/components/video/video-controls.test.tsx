import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { VideoControls } from "./video-controls";

function setup({ show = true, paused = true }: { show?: boolean; paused?: boolean } = {}) {
  const video = document.createElement("video");
  video.play = vi.fn(() => {
    Object.defineProperty(video, "paused", { value: false, configurable: true });
    return Promise.resolve();
  });
  video.pause = vi.fn(() => {
    Object.defineProperty(video, "paused", { value: true, configurable: true });
  });
  Object.defineProperty(video, "paused", { value: paused, configurable: true });
  // jsdom's HTMLMediaElement ignores currentTime writes; make it observable.
  Object.defineProperty(video, "currentTime", { value: 0, writable: true, configurable: true });
  document.body.appendChild(video);

  const ref = createRef<HTMLVideoElement>();
  (ref as { current: HTMLVideoElement | null }).current = video;

  const utils = render(<VideoControls videoRef={ref} show={show} />);
  return { video, ref, ...utils };
}

function controlsBar(): HTMLElement {
  return screen.getByLabelText("Seek").parentElement as HTMLElement;
}

function hoverOverlay(): HTMLElement {
  return controlsBar().parentElement as HTMLElement;
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

  it("keeps the controls visible while the video is paused", () => {
    setup({ paused: true });

    expect(controlsBar()).toHaveStyle({ opacity: "1" });
  });

  it("hides the controls once playback starts until the frame is hovered", () => {
    const { video } = setup({ paused: true });

    act(() => {
      Object.defineProperty(video, "paused", { value: false, configurable: true });
      video.dispatchEvent(new Event("play"));
    });

    expect(controlsBar()).toHaveStyle({ opacity: "0" });

    fireEvent.mouseEnter(hoverOverlay());
    expect(controlsBar()).toHaveStyle({ opacity: "1" });

    fireEvent.mouseLeave(hoverOverlay());
    expect(controlsBar()).toHaveStyle({ opacity: "0" });
  });

  it("toggles playback when the video surface is clicked", () => {
    const { video } = setup({ paused: false });

    act(() => {
      video.dispatchEvent(new Event("play"));
    });

    fireEvent.click(hoverOverlay());
    expect(video.pause).toHaveBeenCalledOnce();
  });

  it("starts playback when a paused surface is clicked", () => {
    const { video } = setup({ paused: true });

    fireEvent.click(hoverOverlay());
    expect(video.play).toHaveBeenCalledOnce();
  });

  it("does not double-toggle when the play button is clicked", () => {
    const { video } = setup({ paused: true });

    fireEvent.click(screen.getByLabelText("Play"));
    expect(video.play).toHaveBeenCalledOnce();
    expect(video.pause).not.toHaveBeenCalled();
  });

  it("disables hit-testing on the bar while it is hidden so invisible buttons cannot pause", () => {
    const { video } = setup({ paused: true });

    act(() => {
      Object.defineProperty(video, "paused", { value: false, configurable: true });
      video.dispatchEvent(new Event("play"));
    });

    expect(controlsBar()).toHaveStyle({ pointerEvents: "none" });
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
    fireEvent.mouseEnter(hoverOverlay());
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

  it("exposes a full-bleed overlay so hovering the video center reveals controls", () => {
    setup();
    const overlay = hoverOverlay();

    // inset: 0 expands the hit area beyond the bottom bar; without it, the
    // center of the video never receives mouseenter and the bar stays hidden.
    expect(overlay.className).toMatch(/inset_0/);
  });

  it("detaches its listeners on unmount", () => {
    const { video, unmount } = setup();
    const removeEventListener = vi.spyOn(video, "removeEventListener");

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("timeupdate", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("volumechange", expect.any(Function));
  });
});
