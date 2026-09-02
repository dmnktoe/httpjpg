import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { GridBuilder } from "./grid-builder";

describe("GridBuilder", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("drops a block, edits it, and undoes the change", async () => {
    render(<GridBuilder pushEnabled={false} siteUrl="https://httpjpg.com" />);

    const canvas = screen.getByRole("application", { name: "Grid canvas" });
    Object.defineProperty(canvas, "clientWidth", { value: 1200, configurable: true });
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      width: 1200,
      height: 800,
      top: 0,
      left: 0,
      bottom: 800,
      right: 1200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fireEvent.drop(canvas, {
      dataTransfer: {
        getData: (type: string) => (type === "application/x-blok-type" ? "headline" : ""),
      },
      clientX: 10,
      clientY: 10,
    });

    expect(screen.getByText("1 items")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Headline block" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Text"), { target: { value: "Studio" } });
    expect(screen.getByText("Studio")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mobile" }));
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    fireEvent.click(screen.getByRole("button", { name: "+ 10 rows" }));
    fireEvent.click(screen.getByRole("button", { name: "− 10 rows" }));
    fireEvent.change(screen.getByLabelText("Cols"), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "Show JSON" }));
    expect(screen.getByText(/"component": "grid"/)).toBeInTheDocument();
  });

  it("opens import and can clear the grid", async () => {
    render(<GridBuilder pushEnabled siteUrl="https://httpjpg.com" />);
    fireEvent.click(screen.getByRole("button", { name: "Import…" }));
    expect(screen.getByRole("dialog", { name: "Import grid" })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Close"));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Import grid" })).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByText("0 items")).toBeInTheDocument();
  });

  it("imports a pasted grid into the canvas", async () => {
    render(<GridBuilder pushEnabled={false} siteUrl="https://httpjpg.com" />);
    fireEvent.click(screen.getByRole("button", { name: "Import…" }));
    fireEvent.change(screen.getByLabelText("Grid or story JSON"), {
      target: {
        value: JSON.stringify({
          component: "grid",
          _uid: "g1",
          columns: "12",
          items: [
            {
              component: "grid_item",
              _uid: "gi",
              colSpan: "4",
              rowSpan: "2",
              content: [{ component: "headline", _uid: "h", text: "Imported" }],
            },
          ],
        }),
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(await screen.findByText("Imported")).toBeInTheDocument();
    expect(screen.getByText("1 items")).toBeInTheDocument();
  });

  it("duplicates the selected block from the keyboard", () => {
    render(<GridBuilder pushEnabled={false} siteUrl="https://httpjpg.com" />);
    const canvas = screen.getByRole("application", { name: "Grid canvas" });
    Object.defineProperty(canvas, "clientWidth", { value: 1200, configurable: true });
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      width: 1200,
      height: 800,
      top: 0,
      left: 0,
      bottom: 800,
      right: 1200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.drop(canvas, {
      dataTransfer: {
        getData: (type: string) => (type === "application/x-blok-type" ? "headline" : ""),
      },
      clientX: 10,
      clientY: 10,
    });
    fireEvent.keyDown(window, { key: "d", metaKey: true });
    expect(screen.getByText("2 items")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Delete" });
    expect(screen.getByText("1 items")).toBeInTheDocument();
  });
});
