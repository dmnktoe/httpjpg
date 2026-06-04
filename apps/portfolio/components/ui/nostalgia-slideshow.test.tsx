import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

interface SlideshowImage {
  url: string;
  alt: string;
}

let lastSlideshowProps: { images: SlideshowImage[]; effect: string; showNavigation: boolean };

vi.mock("@httpjpg/ui", () => ({
  Box: ({ children }: { children: React.ReactNode }) => <div data-testid="box">{children}</div>,
  Slideshow: (props: { images: SlideshowImage[]; effect: string; showNavigation: boolean }) => {
    lastSlideshowProps = props;
    return <div data-testid="slideshow" />;
  },
}));

import { NostalgiaSlideshow } from "./nostalgia-slideshow";

describe("NostalgiaSlideshow", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a slideshow inside a positioning box", () => {
    render(<NostalgiaSlideshow />);

    expect(screen.getByTestId("box")).toBeInTheDocument();
    expect(screen.getByTestId("slideshow")).toBeInTheDocument();
  });

  it("passes the nostalgia icons with the flip effect and no navigation", () => {
    render(<NostalgiaSlideshow />);

    expect(lastSlideshowProps.effect).toBe("flip");
    expect(lastSlideshowProps.showNavigation).toBe(false);
    expect(lastSlideshowProps.images).toHaveLength(4);
    expect(lastSlideshowProps.images.map((image) => image.url)).toEqual([
      "/images/nostalgia/punkbuster.png",
      "/images/nostalgia/hamachi.jpg",
      "/images/nostalgia/m2.jpg",
      "/images/nostalgia/mobileme.jpg",
    ]);
    for (const image of lastSlideshowProps.images) {
      expect(image.alt.length).toBeGreaterThan(0);
    }
  });
});
