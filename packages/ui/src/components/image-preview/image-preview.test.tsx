import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { ImagePreview } from "./image-preview";

const mockPathname = vi.fn<() => string>(() => "/");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

describe("ImagePreview", () => {
  it("renders nothing until an element with data-preview-image is hovered", () => {
    const { container } = render(<ImagePreview />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("shows the preview when a data-preview-image element is hovered", () => {
    document.body.innerHTML = `<a data-preview-image="/preview.jpg">work</a>`;
    render(<ImagePreview />);

    const trigger = document.body.querySelector("[data-preview-image]") as HTMLElement;
    fireEvent.mouseOver(trigger);

    const img = screen.getByAltText("Preview");
    expect(img).toHaveAttribute("src", "/preview.jpg");
  });

  it("uses the data-preview-ratio to size the preview when provided", () => {
    document.body.innerHTML = `<a data-preview-image="/poster.jpg" data-preview-ratio="2:3">film</a>`;
    render(<ImagePreview width={100} />);

    const trigger = document.body.querySelector("[data-preview-image]") as HTMLElement;
    fireEvent.mouseOver(trigger);

    const container = screen.getByAltText("Preview").parentElement as HTMLElement;
    expect(container.style.width).toBe("100px");
    expect(container.style.height).toBe("150px");
  });

  it("falls back to a 16:9 ratio when none is provided", () => {
    document.body.innerHTML = `<a data-preview-image="/preview.jpg">work</a>`;
    render(<ImagePreview width={160} />);

    const trigger = document.body.querySelector("[data-preview-image]") as HTMLElement;
    fireEvent.mouseOver(trigger);

    const container = screen.getByAltText("Preview").parentElement as HTMLElement;
    expect(container.style.height).toBe("90px");
  });

  it("hides the preview on route change so it does not stick to the cursor across pages", () => {
    document.body.innerHTML = `<a data-preview-image="/preview.jpg">work</a>`;
    mockPathname.mockReturnValue("/");
    const { rerender } = render(<ImagePreview />);

    const trigger = document.body.querySelector("[data-preview-image]") as HTMLElement;
    fireEvent.mouseOver(trigger);
    expect(screen.getByAltText("Preview")).toBeInTheDocument();

    mockPathname.mockReturnValue("/work/something");
    rerender(<ImagePreview />);

    expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
  });
});
