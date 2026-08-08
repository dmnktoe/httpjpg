import { act, fireEvent, render, waitFor } from "@testing-library/react";

import { Slideshow, type SlideshowImage } from "./slideshow";

const CLIP_A = "https://a.storyblok.com/f/1/clip-a.mp4";
const CLIP_B = "https://a.storyblok.com/f/1/clip-b.mp4";

const VIDEO_A: SlideshowImage = { url: "", alt: "Clip A", videoUrl: CLIP_A };
const VIDEO_B: SlideshowImage = { url: "", alt: "Clip B", videoUrl: CLIP_B };
const IMAGE_A: SlideshowImage = { url: "https://a.storyblok.com/f/1/a.jpg", alt: "Photo A" };
const IMAGE_B: SlideshowImage = { url: "https://a.storyblok.com/f/1/b.jpg", alt: "Photo B" };

/** Short enough to observe several autoplay ticks inside a test timeout. */
const AUTOPLAY_DELAY = 40;
/** Comfortably longer than a tick, so "did not advance" means it never will. */
const SETTLE = 250;
/** Autoplay effectively off, so only the clip itself can advance the show. */
const NO_AUTOPLAY = 100_000;

let playedSources: string[];
let pausedSources: string[];
let isPlaybackRefused: boolean;

function renderSlideshow(
  images: SlideshowImage[],
  props?: Partial<Parameters<typeof Slideshow>[0]>,
) {
  return render(
    <Slideshow images={images} showCounter speed={0} autoplayDelay={AUTOPLAY_DELAY} {...props} />,
  );
}

/** Counter reads `NN/NN`; the first pair is the 1-based active slide. */
function activeSlide(container: HTMLElement): string {
  return container.textContent?.slice(0, 2) ?? "";
}

function videoFor(container: HTMLElement, src: string): HTMLVideoElement {
  const video = container.querySelector<HTMLVideoElement>(`video[src="${src}"]`);
  if (!video) {
    throw new Error(`No video rendered for ${src}`);
  }
  return video;
}

async function expectSlide(container: HTMLElement, slide: string) {
  await waitFor(() => expect(activeSlide(container)).toBe(slide));
}

/**
 * Asserts the slideshow is parked: it never leaves `slide` within SETTLE.
 * jsdom fires no transition events, so Swiper only re-arms its autoplay timer
 * after a slide change — every "stuck" assertion is preceded by one.
 */
async function expectStuckOn(container: HTMLElement, slide: string) {
  await expect(
    waitFor(() => expect(activeSlide(container)).not.toBe(slide), { timeout: SETTLE }),
  ).rejects.toThrow();
}

beforeEach(() => {
  playedSources = [];
  pausedSources = [];
  isPlaybackRefused = false;

  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(
    function (this: HTMLMediaElement) {
      playedSources.push(this.src);
      return isPlaybackRefused
        ? Promise.reject(new Error("NotAllowedError"))
        : Promise.resolve(undefined);
    },
  );
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
    function (this: HTMLMediaElement) {
      pausedSources.push(this.src);
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Slideshow autoplay", () => {
  it("rotates through image slides on its own", async () => {
    const { container } = renderSlideshow([IMAGE_A, IMAGE_B]);

    expect(activeSlide(container)).toBe("01");
    await expectSlide(container, "02");
  });

  it("holds on a video slide instead of swiping mid-clip", async () => {
    const { container } = renderSlideshow([VIDEO_A, IMAGE_A]);

    await expectStuckOn(container, "01");
  });

  it("stops autoplay when a video slide is reached mid-rotation", async () => {
    const { container, getByLabelText } = renderSlideshow([IMAGE_A, VIDEO_A, IMAGE_B]);

    fireEvent.click(getByLabelText("Next slide"));
    await expectSlide(container, "02");

    await expectStuckOn(container, "02");
  });

  it("advances once the clip played through", async () => {
    const { container } = renderSlideshow([VIDEO_A, IMAGE_A], { autoplayDelay: NO_AUTOPLAY });

    await expectStuckOn(container, "01");
    fireEvent.ended(videoFor(container, CLIP_A));

    await expectSlide(container, "02");
  });

  it("resumes autoplay on the slide after the clip", async () => {
    const { container } = renderSlideshow([VIDEO_A, IMAGE_A, IMAGE_B]);

    fireEvent.ended(videoFor(container, CLIP_A));
    await expectSlide(container, "02");

    await expectSlide(container, "03");
  });

  it("resumes autoplay when the user navigates off the video manually", async () => {
    const { container, getByLabelText } = renderSlideshow([VIDEO_A, IMAGE_A, IMAGE_B]);

    await expectStuckOn(container, "01");
    fireEvent.click(getByLabelText("Next slide"));
    await expectSlide(container, "02");

    await expectSlide(container, "03");
  });

  it("holds again when the user navigates back onto the video", async () => {
    const { container, getByLabelText } = renderSlideshow([VIDEO_A, IMAGE_A, IMAGE_B], {
      autoplayDelay: NO_AUTOPLAY,
    });

    fireEvent.click(getByLabelText("Next slide"));
    await expectSlide(container, "02");

    fireEvent.click(getByLabelText("Previous slide"));
    await expectSlide(container, "01");

    await waitFor(() => expect(playedSources.filter((src) => src === CLIP_A)).toHaveLength(2));
    await expectStuckOn(container, "01");
  });

  it("chains straight into a following video slide", async () => {
    const { container } = renderSlideshow([VIDEO_A, VIDEO_B]);

    fireEvent.ended(videoFor(container, CLIP_A));
    await expectSlide(container, "02");

    expect(playedSources).toContain(CLIP_B);
    await expectStuckOn(container, "02");
  });
});

describe("Slideshow video playback", () => {
  it("plays the active clip and leaves inactive ones paused", async () => {
    renderSlideshow([VIDEO_A, VIDEO_B]);

    await waitFor(() => expect(playedSources).toContain(CLIP_A));
    expect(playedSources).not.toContain(CLIP_B);
    expect(pausedSources).toContain(CLIP_B);
  });

  it("plays a clip once rather than looping it", () => {
    const { container } = renderSlideshow([VIDEO_A, IMAGE_A]);

    expect(videoFor(container, CLIP_A).loop).toBe(false);
  });

  it("rewinds and pauses the clip when its slide is left", async () => {
    const { container } = renderSlideshow([VIDEO_A, IMAGE_A]);

    const video = videoFor(container, CLIP_A);
    video.currentTime = 5;
    fireEvent.ended(video);
    await expectSlide(container, "02");

    expect(video.currentTime).toBe(0);
    expect(pausedSources).toContain(CLIP_A);
  });

  it("replays from the top when the slide comes back around", async () => {
    const { container } = renderSlideshow([VIDEO_A, IMAGE_A]);

    await waitFor(() => expect(playedSources).toContain(CLIP_A));
    const video = videoFor(container, CLIP_A);
    video.currentTime = 5;

    fireEvent.ended(video);
    await expectSlide(container, "02");
    await expectSlide(container, "01");

    await waitFor(() => expect(playedSources.filter((src) => src === CLIP_A)).toHaveLength(2));
    expect(video.currentTime).toBe(0);
  });
});

describe("Slideshow video slide rendering", () => {
  it("labels a video slide with its copyright, dark by default", () => {
    const { getByText } = renderSlideshow([{ ...VIDEO_A, copyright: "Studio" }, IMAGE_A]);

    expect(getByText(/Studio/)).toHaveClass("c_black");
  });

  it("honors an explicit copyright position on a video slide", () => {
    const { getByText } = renderSlideshow([
      { ...VIDEO_A, copyright: "Studio", copyrightPosition: "inline-white" },
      IMAGE_A,
    ]);

    expect(getByText(/Studio/)).toHaveClass("c_white");
  });

  it("renders no copyright label on a video slide without one", () => {
    const { queryByText } = renderSlideshow([VIDEO_A, IMAGE_A]);

    expect(queryByText(/©/)).toBeNull();
  });

  it("holds the clip under a transition effect too", async () => {
    const { container } = renderSlideshow([VIDEO_A, IMAGE_A], { effect: "fade" });

    await expectStuckOn(container, "01");
    fireEvent.ended(videoFor(container, CLIP_A));

    await expectSlide(container, "02");
  });
});

describe("Slideshow video failure modes", () => {
  it("moves on when the browser refuses to play the clip", async () => {
    isPlaybackRefused = true;
    const { container } = renderSlideshow([VIDEO_A, IMAGE_A], { autoplayDelay: NO_AUTOPLAY });

    await expectSlide(container, "02");
  });

  it("moves on when the clip fails to load", async () => {
    const { container } = renderSlideshow([VIDEO_A, IMAGE_A], { autoplayDelay: NO_AUTOPLAY });

    fireEvent.error(videoFor(container, CLIP_A));

    await expectSlide(container, "02");
  });

  it("advances only once when a clip both errors and ends", async () => {
    const { container } = renderSlideshow([VIDEO_A, IMAGE_A, IMAGE_B], {
      autoplayDelay: NO_AUTOPLAY,
    });

    const video = videoFor(container, CLIP_A);
    // Dispatched in one batch: React re-renders after the act block, so both
    // events still reach the same listener pair.
    act(() => {
      video.dispatchEvent(new Event("error"));
      video.dispatchEvent(new Event("ended"));
    });

    await expectSlide(container, "02");
    await expectStuckOn(container, "02");
  });
});

describe("Slideshow waitForVideo opt-outs", () => {
  it("loops the clip and keeps rotating when waiting is disabled", async () => {
    const { container } = renderSlideshow([VIDEO_A, IMAGE_A], { waitForVideo: false });

    expect(videoFor(container, CLIP_A).loop).toBe(true);
    await expectSlide(container, "02");
  });

  it("loops a lone video, since there is nothing to advance to", () => {
    const { container } = renderSlideshow([VIDEO_A]);

    expect(videoFor(container, CLIP_A).loop).toBe(true);
  });

  it("does not hijack playback of a lone video", () => {
    renderSlideshow([VIDEO_A]);

    expect(playedSources).toHaveLength(0);
    expect(pausedSources).toHaveLength(0);
  });
});
