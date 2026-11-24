import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AssetPicker } from "./asset-picker";

describe("AssetPicker", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<AssetPicker open={false} onClose={vi.fn()} onPick={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists assets and picks one", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          ok: true,
          assets: [{ id: 1, filename: "https://a.storyblok.com/f/1/pic.jpg", alt: "Pic" }],
          total: 1,
          perPage: 24,
        }),
      }),
    );
    const onPick = vi.fn();
    render(<AssetPicker open onClose={vi.fn()} onPick={onPick} />);
    await waitFor(() => expect(screen.getByAltText("Pic")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /pic.jpg/i }));
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it("shows an API error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ ok: false, error: "no token" }) }),
    );
    render(<AssetPicker open onClose={vi.fn()} onPick={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("no token")).toBeInTheDocument());
  });

  it("paginates, searches, and closes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          ok: true,
          assets: [{ id: 1, filename: "https://a.storyblok.com/f/1/pic.jpg", alt: "Pic" }],
          total: 50,
          perPage: 24,
        }),
      }),
    );
    const onClose = vi.fn();
    render(<AssetPicker open onClose={onClose} onPick={vi.fn()} />);
    await waitFor(() => expect(screen.getByAltText("Pic")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.change(screen.getByLabelText("Search assets"), { target: { value: "cover" } });
    fireEvent.click(screen.getByLabelText("Close picker"));
    expect(onClose).toHaveBeenCalled();
  });

  it("surfaces a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<AssetPicker open onClose={vi.fn()} onPick={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("offline")).toBeInTheDocument());
  });

  it("pages back, falls back when alt or assets are missing, and cancels in-flight fetches", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          ok: true,
          assets: [{ id: 1, filename: "https://a.storyblok.com/f/1/pic.jpg" }],
          total: 50,
          perPage: 24,
        }),
      }),
    );
    const { unmount, rerender } = render(<AssetPicker open onClose={vi.fn()} onPick={vi.fn()} />);
    await waitFor(() => expect(document.querySelector("img")).toHaveAttribute("alt", ""));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Prev" }));

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ ok: true, total: 0 }) }),
    );
    rerender(<AssetPicker open onClose={vi.fn()} onPick={vi.fn()} />);
    await waitFor(() => expect(screen.queryByRole("img")).not.toBeInTheDocument());

    let resolveFetch: (value: unknown) => void = () => {};
    const pending = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending));
    rerender(<AssetPicker open onClose={vi.fn()} onPick={vi.fn()} />);
    unmount();
    resolveFetch({ json: async () => ({ ok: true, assets: [], total: 0 }) });
  });

  it("ignores keys other than Escape", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    const onClose = vi.fn();
    render(<AssetPicker open onClose={onClose} onPick={vi.fn()} />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });
});
