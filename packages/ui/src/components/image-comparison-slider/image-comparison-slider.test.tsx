import { fireEvent, render, screen } from "@testing-library/react";

import { ImageComparisonSlider } from "./image-comparison-slider";
import { bracketLabel, clampPosition, formatPositionLabel, positionFromClient } from "./lib";

const FRAME = {
  x: 0,
  y: 0,
  left: 0,
  top: 0,
  right: 200,
  bottom: 100,
  width: 200,
  height: 100,
  toJSON: () => ({}),
} satisfies DOMRect;

function renderSlider(props: Partial<Parameters<typeof ImageComparisonSlider>[0]> = {}) {
  return render(
    <ImageComparisonSlider
      beforeSrc="/before.jpg"
      afterSrc="/after.jpg"
      beforeAlt="Before photo"
      afterAlt="After photo"
      {...props}
    />,
  );
}

describe("clampPosition", () => {
  it("keeps values inside 0–100", () => {
    expect(clampPosition(-10)).toBe(0);
    expect(clampPosition(50)).toBe(50);
    expect(clampPosition(140)).toBe(100);
  });

  it("falls back when the value is not finite", () => {
    expect(clampPosition(Number.NaN)).toBe(50);
    expect(clampPosition(Number.POSITIVE_INFINITY)).toBe(50);
  });
});

describe("formatPositionLabel", () => {
  it("pads the readout to three digits", () => {
    expect(formatPositionLabel(7)).toBe("[ 007 / 100 ]");
    expect(formatPositionLabel(50)).toBe("[ 050 / 100 ]");
    expect(formatPositionLabel(100)).toBe("[ 100 / 100 ]");
  });
});

describe("bracketLabel", () => {
  it("wraps copy in lightbox-style brackets", () => {
    expect(bracketLabel("BEFORE")).toBe("[ BEFORE ]");
  });
});

describe("positionFromClient", () => {
  it("maps a horizontal click to a percentage of the frame", () => {
    expect(positionFromClient(50, 0, FRAME, "horizontal")).toBe(25);
    expect(positionFromClient(200, 0, FRAME, "horizontal")).toBe(100);
  });

  it("maps a vertical click to a percentage of the frame", () => {
    expect(positionFromClient(0, 25, FRAME, "vertical")).toBe(25);
  });

  it("clamps clicks that miss the frame", () => {
    expect(positionFromClient(-40, 0, FRAME, "horizontal")).toBe(0);
    expect(positionFromClient(400, 0, FRAME, "horizontal")).toBe(100);
  });
});

describe("ImageComparisonSlider", () => {
  it("renders nothing without both sources", () => {
    const { container } = render(
      <ImageComparisonSlider beforeSrc="" afterSrc="/after.jpg" beforeAlt="A" afterAlt="B" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders both images and the default ASCII chrome", () => {
    renderSlider();

    expect(screen.getByAltText("Before photo")).toHaveAttribute("src", "/before.jpg");
    expect(screen.getByAltText("After photo")).toHaveAttribute("src", "/after.jpg");
    expect(screen.getByText("[ BEFORE ]")).toBeInTheDocument();
    expect(screen.getByText("[ AFTER ]")).toBeInTheDocument();
    expect(screen.getByText("[ 050 / 100 ]")).toBeInTheDocument();
    expect(screen.getByText("[ ↔ ]")).toBeInTheDocument();
  });

  it("exposes a labelled slider at the starting position", () => {
    renderSlider({ initialPosition: 32, beforeLabel: "OLD", afterLabel: "NEW" });
    const slider = screen.getByRole("slider", { name: "Compare OLD and NEW" });

    expect(slider).toHaveValue("32");
    expect(slider).toHaveAttribute("aria-orientation", "horizontal");
    expect(screen.getByText("[ 032 / 100 ]")).toBeInTheDocument();
  });

  it("moves the handle when the range changes", () => {
    renderSlider();
    const slider = screen.getByRole("slider");

    fireEvent.change(slider, { target: { value: "72" } });

    expect(slider).toHaveValue("72");
    expect(screen.getByText("[ 072 / 100 ]")).toBeInTheDocument();
  });

  it("seeks from a pointer down on the frame", () => {
    renderSlider();
    const slider = screen.getByRole("slider");
    const frame = slider.parentElement;
    if (!frame) {
      throw new Error("expected a frame around the range input");
    }
    vi.spyOn(frame, "getBoundingClientRect").mockReturnValue(FRAME);

    fireEvent.pointerDown(slider, { button: 0, clientX: 50, clientY: 40 });

    expect(slider).toHaveValue("25");
  });

  it("hides the labels and readout when asked", () => {
    renderSlider({ showLabels: false, showPosition: false });

    expect(screen.queryByText("[ BEFORE ]")).not.toBeInTheDocument();
    expect(screen.queryByText("[ 050 / 100 ]")).not.toBeInTheDocument();
  });

  it("uses a vertical handle glyph when stacked", () => {
    renderSlider({ orientation: "vertical" });

    expect(screen.getByRole("slider")).toHaveAttribute("aria-orientation", "vertical");
    expect(screen.getByText("[ ↕ ]")).toBeInTheDocument();
  });
});
