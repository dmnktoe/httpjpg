import { act, render, screen } from "@testing-library/react";
import { createRef } from "react";

import { DeviceFrame } from "./device-frame";

let resizeCallback: (() => void) | null = null;

beforeEach(() => {
  resizeCallback = null;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(cb: () => void) {
        resizeCallback = cb;
      }
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function setWidth(container: HTMLElement, width: number) {
  const root = container.firstElementChild as HTMLElement;
  Object.defineProperty(root, "clientWidth", { value: width, configurable: true });
  act(() => resizeCallback?.());
}

describe("DeviceFrame", () => {
  it("renders the device, clips the screen and projects the media once measured", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <DeviceFrame ref={ref} device="psp">
        <p>media</p>
      </DeviceFrame>,
    );
    expect(ref.current).toBe(container.firstElementChild);
    expect(screen.getByRole("img", { name: "Sony PSP" })).toHaveAttribute(
      "src",
      "/images/devices/psp.webp",
    );
    expect(screen.getByText("media")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-device-frame", "psp");

    const clip = container.querySelector<HTMLElement>("[data-device-screen]")?.parentElement;
    expect(clip?.style.clipPath).toMatch(/^polygon\(.*%\)$/);

    setWidth(container, 900);
    expect(clip?.style.visibility).toBe("visible");
    const media = container.querySelector<HTMLElement>("[data-device-screen]");
    expect(media?.style.transform.startsWith("matrix3d(")).toBe(true);
    expect(Number.parseFloat(media?.style.width ?? "0")).toBeGreaterThan(0);
  });

  it("keeps a screened copy of the photo for gloss unless disabled", () => {
    const { container, rerender } = render(
      <DeviceFrame device="psp">
        <p>media</p>
      </DeviceFrame>,
    );
    expect(container.querySelectorAll("img")).toHaveLength(2);
    rerender(
      <DeviceFrame device="psp" gloss={false}>
        <p>media</p>
      </DeviceFrame>,
    );
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });

  it("accepts a custom preset", () => {
    const { container } = render(
      <DeviceFrame
        device={{
          name: "Test device",
          src: "/test.webp",
          width: 200,
          height: 100,
          screen: [
            [20, 10],
            [180, 10],
            [180, 90],
            [20, 90],
          ],
          screenAspect: "2/1",
        }}
      >
        <p>media</p>
      </DeviceFrame>,
    );
    expect(container.firstElementChild).toHaveAttribute("data-device-frame", "custom");
    expect(screen.getByRole("img", { name: "Test device" })).toBeInTheDocument();
    setWidth(container, 400);
    const media = container.querySelector<HTMLElement>("[data-device-screen]");
    // 160 px wide screen in a 200 px image, shown at 400 px → 320 px.
    expect(media?.style.width).toBe("320px");
    expect(media?.style.height).toBe("160px");
  });
});
