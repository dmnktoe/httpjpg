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
        aspectRatio: "3/4",
        idle: true,
        gyro: true,
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
  });
});
