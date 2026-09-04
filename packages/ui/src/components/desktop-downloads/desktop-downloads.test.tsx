import { fireEvent, render, screen } from "@testing-library/react";

import { DesktopDownloads } from "./desktop-downloads";
import { DESKTOP_ICON_SRC } from "./lib";

const ITEMS = [
  { id: "pdf", name: "Press kit.pdf", url: "https://cdn.example/press.pdf" },
  { id: "zip", name: "Source.zip", url: "https://cdn.example/source.zip" },
  { id: "img", name: "Poster", url: "https://cdn.example/poster.png" },
];

describe("DesktopDownloads", () => {
  afterEach(() => {
    DESKTOP_ICON_SRC.pdf = undefined;
  });

  it("renders nothing when there are no usable items", () => {
    render(<DesktopDownloads items={[{ id: "x", name: "", url: "" }]} />);
    expect(screen.queryByRole("group", { name: "Work downloads" })).toBeNull();
  });

  it("portals one icon per file onto document.body", () => {
    const { container } = render(<DesktopDownloads items={ITEMS} />);

    expect(container.querySelector("fieldset")).toBeNull();
    expect(screen.getByRole("group", { name: "Work downloads" }).parentElement).toBe(document.body);
    expect(screen.getByRole("button", { name: "Download Press kit.pdf" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download Source.zip" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download Poster" })).toBeInTheDocument();
  });

  it("picks a glyph from the file extension", () => {
    render(<DesktopDownloads items={ITEMS} />);

    expect(screen.getByRole("button", { name: "Download Press kit.pdf" })).toHaveAttribute(
      "data-file-kind",
      "pdf",
    );
    expect(screen.getByRole("button", { name: "Download Source.zip" })).toHaveAttribute(
      "data-file-kind",
      "zip",
    );
    expect(screen.getByRole("button", { name: "Download Poster" })).toHaveAttribute(
      "data-file-kind",
      "image",
    );
    expect(screen.getByRole("button", { name: "Download Press kit.pdf" }).textContent).toContain(
      "PDF",
    );
  });

  it("selects on pointer down and clears selection outside the layer", () => {
    render(<DesktopDownloads items={ITEMS} />);
    const icon = screen.getByRole("button", { name: "Download Press kit.pdf" });

    fireEvent.pointerDown(icon, { button: 0, pointerId: 1, clientX: 20, clientY: 20 });
    expect(icon).toHaveAttribute("aria-pressed", "true");

    fireEvent.pointerDown(document.body, { button: 0, pointerId: 2 });
    expect(icon).toHaveAttribute("aria-pressed", "false");
  });

  it("starts a download on double-click and on Enter", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<DesktopDownloads items={ITEMS} />);
    const icon = screen.getByRole("button", { name: "Download Press kit.pdf" });

    fireEvent.doubleClick(icon);
    expect(click).toHaveBeenCalledOnce();
    expect((click.mock.instances[0] as HTMLAnchorElement).download).toBe("Press kit.pdf");

    fireEvent.keyDown(icon, { key: "Enter" });
    expect(click).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(icon, { key: " " });
    expect(click).toHaveBeenCalledTimes(3);

    click.mockRestore();
  });

  it("does not download on a single click", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<DesktopDownloads items={ITEMS} />);

    fireEvent.click(screen.getByRole("button", { name: "Download Press kit.pdf" }));
    expect(click).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Download Press kit.pdf" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    click.mockRestore();
  });

  it("drags past the threshold into pixel positioning", () => {
    render(<DesktopDownloads items={[ITEMS[0]]} />);
    const icon = screen.getByRole("button", { name: "Download Press kit.pdf" });

    vi.spyOn(icon, "getBoundingClientRect").mockReturnValue({
      x: 120,
      y: 80,
      left: 120,
      top: 80,
      width: 76,
      height: 86,
      right: 196,
      bottom: 166,
      toJSON() {
        return {};
      },
    });

    fireEvent.pointerDown(icon, { button: 0, pointerId: 1, clientX: 130, clientY: 90 });
    fireEvent.pointerMove(icon, { pointerId: 1, clientX: 180, clientY: 140 });

    expect(icon.style.left).toBe("170px");
    expect(icon.style.top).toBe("130px");

    fireEvent.pointerUp(icon, { pointerId: 1 });
    fireEvent.pointerMove(icon, { pointerId: 1, clientX: 400, clientY: 400 });
    expect(icon.style.left).toBe("170px");
  });

  it("ignores a tiny pointer wiggle so a click still selects", () => {
    render(<DesktopDownloads items={[ITEMS[0]]} />);
    const icon = screen.getByRole("button", { name: "Download Press kit.pdf" });
    const initialLeft = icon.style.left;

    vi.spyOn(icon, "getBoundingClientRect").mockReturnValue({
      x: 40,
      y: 40,
      left: 40,
      top: 40,
      width: 76,
      height: 86,
      right: 116,
      bottom: 126,
      toJSON() {
        return {};
      },
    });

    fireEvent.pointerDown(icon, { button: 0, pointerId: 1, clientX: 50, clientY: 50 });
    fireEvent.pointerMove(icon, { pointerId: 1, clientX: 51, clientY: 51 });

    expect(icon.style.left).toBe(initialLeft);
    expect(icon).toHaveAttribute("aria-pressed", "true");
  });

  it("ignores a non-primary pointer button", () => {
    render(<DesktopDownloads items={[ITEMS[0]]} />);
    const icon = screen.getByRole("button", { name: "Download Press kit.pdf" });

    fireEvent.pointerDown(icon, { button: 1, pointerId: 1, clientX: 20, clientY: 20 });
    expect(icon).toHaveAttribute("aria-pressed", "false");
  });

  it("uses a provided icon src instead of the placeholder svg", () => {
    DESKTOP_ICON_SRC.pdf = "/desktop-icons/pdf.png";
    render(<DesktopDownloads items={[ITEMS[0]]} />);

    const img = screen.getByRole("button", { name: "Download Press kit.pdf" }).querySelector("img");
    expect(img).toHaveAttribute("src", "/desktop-icons/pdf.png");
    expect(screen.queryByText("PDF")).toBeNull();
  });
});
