import { render } from "@testing-library/react";

import { SbHoloImage } from "./SbHoloImage";

const { mockHoloCard } = vi.hoisted(() => ({ mockHoloCard: vi.fn() }));

vi.mock("@httpjpg/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@httpjpg/ui")>();
  return {
    ...actual,
    HoloCard: (props: Record<string, unknown>) => {
      mockHoloCard(props);
      return (
        <div data-testid="holo">
          <img src={props.src as string} alt={props.alt as string} />
          {props.children as React.ReactNode}
        </div>
      );
    },
  };
});

const filename = "https://a.storyblok.com/f/1/1200x1600/abc/image.jpg";

beforeEach(() => {
  mockHoloCard.mockClear();
});

describe("SbHoloImage", () => {
  it("returns null without an image filename", () => {
    const { container } = render(
      <SbHoloImage blok={{ _uid: "1", component: "holo_image" } as never} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a card with defaults, credit and a caption", () => {
    const { container } = render(
      <SbHoloImage
        blok={
          {
            _uid: "2",
            component: "holo_image",
            image: { filename, title: "Still", copyright: "Studio", source: "film" },
            caption: {
              type: "doc",
              content: [{ type: "paragraph", content: [{ type: "text", text: "A still" }] }],
            },
          } as never
        }
      />,
    );
    expect(container.querySelector('img[alt="Still"]')).not.toBeNull();
    expect(container.textContent).toContain("A still");
    expect(mockHoloCard).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "card",
        aspectRatio: "5/7",
        idle: true,
        gyro: true,
        foil: "silver",
        sparkle: "stars",
        loading: "lazy",
        copyright: "Studio",
        copyrightSource: "film",
        intensity: undefined,
        maxTilt: undefined,
      }),
    );
  });

  it("crops discs square, clamps the intensity and drops a zero tilt", () => {
    render(
      <SbHoloImage
        blok={
          {
            _uid: "3",
            component: "holo_image",
            image: { filename, alt: "Disc" },
            variant: "disc",
            aspectRatio: "16/9",
            intensity: 4,
            maxTilt: 0,
            idle: false,
            gyro: false,
            isLoadingEager: true,
            width: "50%",
            widthLg: "30%",
            depth: 2,
            foreground: { filename: "https://a.storyblok.com/f/1/1200x1600/def/cutout.png" },
            effects: { filename: "https://a.storyblok.com/f/1/1632x2176/ghi/shards.png" },
            depthMap: { filename: "https://a.storyblok.com/f/1/1200x1600/jkl/depth.png" },
            foil: "swirl",
            sparkle: "fireworks",
          } as never
        }
      />,
    );
    const props = mockHoloCard.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(props.variant).toBe("disc");
    expect(props.src).toContain("/m/");
    expect(props.intensity).toBe(1);
    expect(props.maxTilt).toBeUndefined();
    expect(props.idle).toBe(false);
    expect(props.gyro).toBe(false);
    expect(props.loading).toBe("eager");
    expect(props.sizes).toBe("(min-width: 1024px) 30vw, 50vw");
    expect(props.depth).toBe(2);
    expect(String(props.foregroundSrc)).toMatch(/^\/_next\/image\?url=.*cutout\.png/);
    expect(String(props.textureSrc)).toMatch(/^\/_next\/image\?url=.*image\.jpg/);
    expect(String(props.src)).toContain("a.storyblok.com");
    // effects keep their own frame (no crop), the depth map shares the photo's crop
    expect(String(props.effectsSrc)).toMatch(/^\/_next\/image\?url=.*shards\.png&w=/);
    expect(decodeURIComponent(String(props.effectsSrc))).not.toContain("/m/");
    expect(decodeURIComponent(String(props.depthSrc))).toContain("/m/");
    expect(props.foil).toBe("swirl");
    expect(props.sparkle).toBe("fireworks");
    expect(props.foregroundFrame).toBe("card");
  });

  it("leaves an overhang-frame cut-out uncropped", () => {
    render(
      <SbHoloImage
        blok={
          {
            _uid: "holo-3",
            component: "holo_image",
            image: { filename: "https://a.storyblok.com/f/1/1200x1600/abc/image.jpg" },
            foreground: { filename: "https://a.storyblok.com/f/1/1632x2176/def/cutout.png" },
            foregroundFrame: "overhang",
          } as never
        }
      />,
    );
    const props = mockHoloCard.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(props.foregroundFrame).toBe("overhang");
    expect(decodeURIComponent(String(props.foregroundSrc))).not.toContain("/m/");
    expect(String(props.foregroundSrc)).toMatch(/^\/_next\/image\?url=.*cutout\.png&w=/);
  });
});
