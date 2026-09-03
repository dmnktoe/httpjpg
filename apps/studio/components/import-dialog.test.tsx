import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ImportDialog } from "./import-dialog";

const GRID = {
  component: "grid",
  _uid: "g1",
  columns: "12",
  items: [
    {
      component: "grid_item",
      _uid: "gi",
      colSpan: "4",
      rowSpan: "2",
      content: [{ component: "headline", _uid: "h", text: "Hi" }],
    },
  ],
};

describe("ImportDialog", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ImportDialog open={false} pushEnabled onClose={vi.fn()} onImport={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("imports a pasted grid blok", () => {
    const onImport = vi.fn();
    const onClose = vi.fn();
    render(<ImportDialog open pushEnabled={false} onClose={onClose} onImport={onImport} />);

    fireEvent.change(screen.getByLabelText("Grid or story JSON"), {
      target: { value: JSON.stringify(GRID) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(onImport).toHaveBeenCalledWith(
      expect.objectContaining({ items: [expect.objectContaining({ type: "headline" })] }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("asks which grid to use when several are present", () => {
    const onImport = vi.fn();
    render(<ImportDialog open pushEnabled={false} onClose={vi.fn()} onImport={onImport} />);
    fireEvent.change(screen.getByLabelText("Grid or story JSON"), {
      target: {
        value: JSON.stringify({
          body: [GRID, { ...GRID, _uid: "g2" }],
        }),
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(onImport).not.toHaveBeenCalled();
    expect(screen.getByText(/Multiple grids found/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Import grid 1" }));
    expect(onImport).toHaveBeenCalled();
  });

  it("shows a parse error for invalid JSON", () => {
    render(<ImportDialog open pushEnabled={false} onClose={vi.fn()} onImport={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Grid or story JSON"), { target: { value: "{nope" } });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(screen.getByText(/Expected property name/)).toBeInTheDocument();
  });

  it("fetches a story and imports its first grid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, story: { content: { body: [GRID] } } }),
      }),
    );
    const onImport = vi.fn();
    render(<ImportDialog open pushEnabled onClose={vi.fn()} onImport={onImport} />);
    fireEvent.click(screen.getByRole("button", { name: "Fetch from Storyblok" }));
    fireEvent.change(screen.getByLabelText("Story full_slug"), { target: { value: "work/demo" } });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    await waitFor(() => expect(onImport).toHaveBeenCalled());
  });

  it("closes from the backdrop and Escape", () => {
    const onClose = vi.fn();
    render(<ImportDialog open pushEnabled={false} onClose={onClose} onImport={vi.fn()} />);
    fireEvent.click(screen.getByLabelText("Close import dialog"));
    expect(onClose).toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("imports from a story payload and a content.body wrapper", () => {
    const onImport = vi.fn();
    const { rerender } = render(
      <ImportDialog open pushEnabled={false} onClose={vi.fn()} onImport={onImport} />,
    );
    fireEvent.change(screen.getByLabelText("Grid or story JSON"), {
      target: { value: JSON.stringify({ story: { content: { body: [GRID] } } }) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(onImport).toHaveBeenCalled();

    onImport.mockClear();
    rerender(<ImportDialog open pushEnabled={false} onClose={vi.fn()} onImport={onImport} />);
    fireEvent.change(screen.getByLabelText("Grid or story JSON"), {
      target: { value: JSON.stringify({ content: { body: [GRID] } }) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(onImport).toHaveBeenCalled();
  });

  it("errors when a fetched story has no grid or the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, story: { content: { body: [{ component: "headline" }] } } }),
      }),
    );
    render(<ImportDialog open pushEnabled onClose={vi.fn()} onImport={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Fetch from Storyblok" }));
    fireEvent.change(screen.getByLabelText("Story full_slug"), { target: { value: "work/demo" } });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    await waitFor(() => expect(screen.getByText(/has no grid blok/)).toBeInTheDocument());
  });

  it("surfaces fetch HTTP and network failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ ok: false, error: "no token" }),
      }),
    );
    const { rerender } = render(
      <ImportDialog open pushEnabled onClose={vi.fn()} onImport={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Fetch from Storyblok" }));
    fireEvent.change(screen.getByLabelText("Story full_slug"), { target: { value: "work/demo" } });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    await waitFor(() => expect(screen.getByText("no token")).toBeInTheDocument());

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    rerender(<ImportDialog open pushEnabled onClose={vi.fn()} onImport={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Fetch from Storyblok" }));
    fireEvent.change(screen.getByLabelText("Story full_slug"), { target: { value: "work/demo" } });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    await waitFor(() => expect(screen.getByText("offline")).toBeInTheDocument());
  });

  it("falls back to the HTTP status when a fetch has no error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      }),
    );
    render(<ImportDialog open pushEnabled onClose={vi.fn()} onImport={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Fetch from Storyblok" }));
    fireEvent.change(screen.getByLabelText("Story full_slug"), { target: { value: "work/demo" } });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    await waitFor(() => expect(screen.getByText("HTTP 500")).toBeInTheDocument());
  });

  it("rejects JSON that is not a grid payload", () => {
    render(<ImportDialog open pushEnabled={false} onClose={vi.fn()} onImport={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Grid or story JSON"), {
      target: { value: JSON.stringify({ foo: 1 }) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(screen.getByText(/Could not find a grid blok/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  });

  it("lets the editor pick a different grid then go back", () => {
    const onImport = vi.fn();
    render(<ImportDialog open pushEnabled={false} onClose={vi.fn()} onImport={onImport} />);
    fireEvent.change(screen.getByLabelText("Grid or story JSON"), {
      target: { value: JSON.stringify({ body: [GRID, { ...GRID, _uid: "g2" }] }) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    fireEvent.change(screen.getByLabelText("Grid"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Import grid 2" }));
    expect(onImport).toHaveBeenCalled();
  });

  it("summarizes a grid that omits items and columns", () => {
    const onImport = vi.fn();
    render(<ImportDialog open pushEnabled={false} onClose={vi.fn()} onImport={onImport} />);
    fireEvent.change(screen.getByLabelText("Grid or story JSON"), {
      target: {
        value: JSON.stringify({
          body: [
            { component: "grid", _uid: "g1" },
            { component: "grid", _uid: "g2", columnsMd: "8" },
          ],
        }),
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(screen.getByText(/#1 · 0 items · \? cols/)).toBeInTheDocument();
    expect(screen.getByText(/#2 · 0 items · 8 cols/)).toBeInTheDocument();
  });
});
