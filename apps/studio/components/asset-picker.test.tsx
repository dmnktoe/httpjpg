import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AssetPicker, StoryPicker } from "./asset-picker";

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
});

describe("StoryPicker", () => {
  it("lists stories scoped by startsWith and picks one", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      json: async () => ({
        ok: true,
        stories: [{ id: 9, uuid: "u1", name: "Demo", full_slug: "work/demo" }],
        total: 1,
        perPage: 25,
      }),
    });
    vi.stubGlobal("fetch", fetchImpl);
    const onPick = vi.fn();
    render(<StoryPicker open startsWith="work/" onClose={vi.fn()} onPick={onPick} />);
    await waitFor(() => expect(screen.getByText("Demo")).toBeInTheDocument());
    expect(fetchImpl.mock.calls[0][0]).toContain("starts_with=work%2F");
    fireEvent.click(screen.getByRole("button", { name: /Demo/ }));
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ uuid: "u1" }));
  });

  it("renders nothing when closed and reports fetch errors", async () => {
    const { container, rerender } = render(
      <StoryPicker open={false} onClose={vi.fn()} onPick={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({ ok: false }) }));
    rerender(<StoryPicker open onClose={vi.fn()} onPick={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("Unknown error")).toBeInTheDocument());
  });

  it("paginates, searches, and closes from the backdrop", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      json: async () => ({
        ok: true,
        stories: [{ id: 1, uuid: "u1", name: "Demo", full_slug: "work/demo" }],
        total: 50,
        perPage: 25,
      }),
    });
    vi.stubGlobal("fetch", fetchImpl);
    const onClose = vi.fn();
    render(<StoryPicker open onClose={onClose} onPick={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("Demo")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.change(screen.getByLabelText("Search stories"), { target: { value: "demo" } });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText("Close"));
  });

  it("surfaces a story picker network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<StoryPicker open onClose={vi.fn()} onPick={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("offline")).toBeInTheDocument());
  });

  it("lists an empty page when stories are omitted and pages back", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ ok: true, total: 50, perPage: 25 }),
      }),
    );
    render(<StoryPicker open startsWith="work/" onClose={vi.fn()} onPick={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("1 / 2")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Prev" }));
    expect(screen.getByText(/work\/\*/)).toBeInTheDocument();
  });
});
