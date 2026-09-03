import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { type ExportedGrid, type GridSettings } from "./lib";
import { Toolbar } from "./toolbar";

const SETTINGS: GridSettings = { columns: 12, columnsMd: 12, columnsLg: 12, gap: "4" };
const EXPORTED: ExportedGrid = { component: "grid", _uid: "g", columns: "12", items: [] };

function renderToolbar(overrides: Partial<Parameters<typeof Toolbar>[0]> = {}) {
  const props = {
    settings: SETTINGS,
    onSettingsChange: vi.fn(),
    viewport: "lg" as const,
    onViewportChange: vi.fn(),
    exported: EXPORTED,
    itemCount: 2,
    pushEnabled: true,
    siteUrl: "https://httpjpg.com",
    canUndo: true,
    canRedo: false,
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onImport: vi.fn(),
    onClear: vi.fn(),
    ...overrides,
  };
  const result = render(<Toolbar {...props} />);
  return { ...result, props };
}

describe("Toolbar", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("switches viewport and reports item count", () => {
    const { props } = renderToolbar();
    expect(screen.getByText("2 items")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mobile" }));
    expect(props.onViewportChange).toHaveBeenCalledWith("base");
  });

  it("copies JSON to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    renderToolbar();
    fireEvent.click(screen.getByRole("button", { name: "Copy JSON" }));
    await waitFor(() => expect(screen.getByText("JSON copied")).toBeInTheDocument());
    expect(writeText).toHaveBeenCalled();
  });

  it("surfaces a clipboard failure", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    renderToolbar();
    fireEvent.click(screen.getByRole("button", { name: "Copy JSON" }));
    await waitFor(() => expect(screen.getByText("Clipboard failed")).toBeInTheDocument());
  });

  it("opens the push panel, validates the slug, and posts the grid", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, action: "appended", index: 0 }),
    });
    vi.stubGlobal("fetch", fetchImpl);

    renderToolbar();
    fireEvent.click(screen.getByRole("button", { name: "Push…" }));
    fireEvent.click(screen.getByRole("button", { name: "Append to story" }));
    expect(screen.getByText("Enter target story full_slug")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Target full_slug"), {
      target: { value: "work/demo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Append to story" }));
    await waitFor(() => expect(screen.getByText(/Appended at body\[0\]/)).toBeInTheDocument());
    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/push",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("can replace at a body index and reports HTTP errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: "Update failed" }),
      }),
    );
    renderToolbar();
    fireEvent.click(screen.getByRole("button", { name: "Push…" }));
    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    fireEvent.change(screen.getByLabelText("body[N]"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Target full_slug"), {
      target: { value: "work/demo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Replace in story" }));
    await waitFor(() => expect(screen.getByText("Update failed")).toBeInTheDocument());
  });

  it("hides push when the management token is missing", () => {
    renderToolbar({ pushEnabled: false });
    expect(screen.queryByRole("button", { name: "Push…" })).toBeNull();
  });

  it("forwards undo, import, and column edits", () => {
    const { props } = renderToolbar({ viewport: "md" });
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(props.onUndo).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Import…" }));
    expect(props.onImport).toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Cols (md)"), { target: { value: "8" } });
    expect(props.onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ columnsMd: 8 }));
  });

  it("edits gap and desktop columns, and reports a thrown push", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { props } = renderToolbar({ viewport: "lg", siteUrl: "" });
    fireEvent.change(screen.getByLabelText("Gap"), { target: { value: "8" } });
    expect(props.onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ gap: "8" }));
    fireEvent.change(screen.getByLabelText("Cols (lg)"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Push…" }));
    fireEvent.change(screen.getByLabelText("Target full_slug"), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "Append to story" }));
    await waitFor(() => expect(screen.getByText("offline")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Hide push" }));
  });

  it("forwards redo and clear, and ignores invalid column values", () => {
    const { props } = renderToolbar({ canRedo: true, viewport: "base" });
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(props.onRedo).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(props.onClear).toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Cols"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("Cols"), { target: { value: "3" } });
    expect(props.onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ columns: 3 }));
  });

  it("reports a replaced push and a generic HTTP error", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, action: "replaced", index: 2 }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 502,
          json: async () => ({}),
        }),
    );
    renderToolbar();
    fireEvent.click(screen.getByRole("button", { name: "Push…" }));
    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    fireEvent.change(screen.getByLabelText("body[N]"), { target: { value: "nope" } });
    fireEvent.change(screen.getByLabelText("Target full_slug"), { target: { value: "work/demo" } });
    fireEvent.click(screen.getByRole("button", { name: "Replace in story" }));
    await waitFor(() => expect(screen.getByText(/Replaced at body\[2\]/)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Replace in story" }));
    await waitFor(() => expect(screen.getByText("HTTP 502")).toBeInTheDocument());
  });
});
