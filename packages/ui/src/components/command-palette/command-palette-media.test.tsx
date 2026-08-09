import { fireEvent, render, screen } from "@testing-library/react";

import { CommandPaletteMedia } from "./command-palette-media";
import type { CommandPaletteResult } from "./command-palette-result";

const RESULTS: CommandPaletteResult[] = [
  {
    id: "1",
    title: "Feed XML",
    href: "/feed-xml_html",
    kind: "page",
    media: [
      { id: "a", kind: "image", thumb: "https://cdn.test/one.jpg", label: "Print run" },
      { id: "b", kind: "audio", thumb: "", label: "mega mashup — te3shay" },
    ],
  },
  {
    id: "2",
    title: "Poster Series",
    href: "/work/posters",
    kind: "work",
    media: [{ id: "c", kind: "image", thumb: "https://cdn.test/two.jpg", label: "" }],
  },
  { id: "3", title: "About", href: "/about", kind: "page" },
];

describe("CommandPaletteMedia", () => {
  it("renders nothing when no result carries media", () => {
    const { container } = render(<CommandPaletteMedia results={[RESULTS[2]]} onSelect={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("labels a tile with its media label and the page it belongs to", () => {
    render(<CommandPaletteMedia results={RESULTS} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Print run — Feed XML" })).toBeInTheDocument();
  });

  it("falls back to the result title when the media has no label", () => {
    render(<CommandPaletteMedia results={RESULTS} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Poster Series" })).toBeInTheDocument();
  });

  it("draws a glyph tile for a track without artwork", () => {
    render(<CommandPaletteMedia results={RESULTS} onSelect={vi.fn()} />);

    const tile = screen.getByRole("button", { name: "mega mashup — te3shay — Feed XML" });
    expect(tile.querySelector("img")).toBeNull();
    expect(tile).toHaveTextContent("♪");
  });

  it("selects the result the thumbnail belongs to", () => {
    const onSelect = vi.fn();
    render(<CommandPaletteMedia results={RESULTS} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: "Print run — Feed XML" }));

    expect(onSelect).toHaveBeenCalledWith(RESULTS[0]);
  });

  it("interleaves results so one page cannot fill the strip", () => {
    render(<CommandPaletteMedia results={RESULTS} limit={2} onSelect={vi.fn()} />);

    const labels = screen.getAllByRole("button").map((tile) => tile.getAttribute("aria-label"));
    expect(labels).toEqual(["Print run — Feed XML", "Poster Series"]);
  });
});
