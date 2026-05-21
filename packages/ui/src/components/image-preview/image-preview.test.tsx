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
