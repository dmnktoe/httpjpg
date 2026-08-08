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

  it("uses the data-preview-width to override the default width when provided", () => {
    document.body.innerHTML = `<a data-preview-image="/poster.jpg" data-preview-ratio="2:3" data-preview-width="70">film</a>`;
    render(<ImagePreview width={100} />);

    const trigger = document.body.querySelector("[data-preview-image]") as HTMLElement;
    fireEvent.mouseOver(trigger);

    const container = screen.getByAltText("Preview").parentElement as HTMLElement;
    expect(container.style.width).toBe("70px");
    expect(container.style.height).toBe("105px");
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

  it("hides the preview again when the pointer leaves the trigger", () => {
    document.body.innerHTML = `<a data-preview-image="/preview.jpg">work</a>`;
    render(<ImagePreview />);
    const trigger = document.body.querySelector("[data-preview-image]") as HTMLElement;

    fireEvent.mouseOver(trigger);
    expect(screen.getByAltText("Preview")).toBeInTheDocument();

    fireEvent.mouseOut(trigger);
    expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
  });

  it("resolves the preview from an ancestor when a child is hovered", () => {
    document.body.innerHTML = `<a data-preview-image="/preview.jpg"><span>work</span></a>`;
    render(<ImagePreview />);

    fireEvent.mouseOver(document.body.querySelector("span") as HTMLElement);

    expect(screen.getByAltText("Preview")).toBeInTheDocument();
  });

  it("ignores elements without a preview attribute", () => {
    document.body.innerHTML = `<a href="/">plain</a>`;
    render(<ImagePreview />);

    fireEvent.mouseOver(document.body.querySelector("a") as HTMLElement);
    fireEvent.mouseOut(document.body.querySelector("a") as HTMLElement);

    expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
  });

  it("ignores an empty preview url", () => {
    document.body.innerHTML = `<a data-preview-image="">work</a>`;
    render(<ImagePreview />);

    fireEvent.mouseOver(document.body.querySelector("a") as HTMLElement);

    expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
  });

  it("falls back to the default ratio for a malformed ratio attribute", () => {
    document.body.innerHTML = `<a data-preview-image="/preview.jpg" data-preview-ratio="0:0">work</a>`;
    render(<ImagePreview width={160} />);

    fireEvent.mouseOver(document.body.querySelector("a") as HTMLElement);

    const container = screen.getByAltText("Preview").parentElement as HTMLElement;
    expect(container.style.height).toBe("90px");
  });

  it("ignores a non-positive width override", () => {
    document.body.innerHTML = `<a data-preview-image="/preview.jpg" data-preview-width="0">work</a>`;
    render(<ImagePreview width={160} />);

    fireEvent.mouseOver(document.body.querySelector("a") as HTMLElement);

    const container = screen.getByAltText("Preview").parentElement as HTMLElement;
    expect(container.style.width).toBe("160px");
  });

  it("follows the pointer with the configured offset", () => {
    document.body.innerHTML = `<a data-preview-image="/preview.jpg">work</a>`;
    render(<ImagePreview offset={{ x: 12, y: 20 }} />);

    fireEvent.mouseOver(document.body.querySelector("a") as HTMLElement);
    fireEvent.mouseMove(document, { clientX: 100, clientY: 200 });

    const container = screen.getByAltText("Preview").parentElement as HTMLElement;
    expect(container.style.transform).toBe("translate(112px, 220px)");
  });

  it("detaches its document listeners on unmount", () => {
    const removeEventListener = vi.spyOn(document, "removeEventListener");

    render(<ImagePreview />).unmount();

    expect(removeEventListener).toHaveBeenCalledWith("mousemove", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("mouseover", expect.any(Function), true);
    expect(removeEventListener).toHaveBeenCalledWith("mouseout", expect.any(Function), true);
    removeEventListener.mockRestore();
  });
});
