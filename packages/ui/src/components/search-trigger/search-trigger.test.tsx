import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { OPEN_SEARCH_EVENT, SearchTrigger } from "./search-trigger";

function mockPointer(isCoarse: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("coarse") ? isCoarse : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

beforeEach(() => {
  mockPointer(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SearchTrigger", () => {
  it("renders an accessible button", () => {
    render(<SearchTrigger />);

    expect(screen.getByRole("button", { name: "Open search" })).toBeInTheDocument();
    expect(screen.getByText("search")).toBeInTheDocument();
  });

  it("accepts a custom label", () => {
    render(<SearchTrigger label="search or ask" />);

    expect(screen.getByText("search or ask")).toBeInTheDocument();
  });

  it("asks the palette to open over the window", () => {
    const listener = vi.fn();
    window.addEventListener(OPEN_SEARCH_EVENT, listener);
    render(<SearchTrigger />);

    fireEvent.click(screen.getByRole("button"));

    expect(listener).toHaveBeenCalled();
    window.removeEventListener(OPEN_SEARCH_EVENT, listener);
  });

  it("calls onTrigger instead of dispatching when given one", () => {
    const onTrigger = vi.fn();
    const listener = vi.fn();
    window.addEventListener(OPEN_SEARCH_EVENT, listener);
    render(<SearchTrigger onTrigger={onTrigger} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onTrigger).toHaveBeenCalled();
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener(OPEN_SEARCH_EVENT, listener);
  });

  it("advertises the shortcut on a device with a keyboard", async () => {
    const { container } = render(<SearchTrigger />);

    await waitFor(() =>
      expect(container.querySelector("[data-badge]")).toHaveTextContent(/^(⌘|\^)K$/),
    );
  });

  it("falls back to a magnifier on touch devices, where there is no keyboard", async () => {
    mockPointer(true);
    const { container } = render(<SearchTrigger />);

    await waitFor(() => expect(screen.getByRole("button")).toBeInTheDocument());
    expect(container.querySelector("[data-badge]")).toHaveTextContent("⌕");
  });

  it("keeps the label readable to assistive tech even when visually hidden", () => {
    render(<SearchTrigger />);

    expect(screen.getByRole("button")).toHaveAccessibleName("Open search");
  });
});
