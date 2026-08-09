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

  it("shows the modifier and K where there is a keyboard", async () => {
    render(<SearchTrigger />);

    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent(/(⌘|\^)\+𝙆$/));
  });

  it("falls back to the word label on touch devices, where there is no keyboard", async () => {
    mockPointer(true);
    render(<SearchTrigger />);

    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent(/search$/));
    expect(screen.getByRole("button")).not.toHaveTextContent("𝙆");
  });

  it("never shows the label and the shortcut in turn", async () => {
    render(<SearchTrigger label="search" />);

    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("𝙆"));
    expect(screen.getByRole("button")).not.toHaveTextContent("search");
  });

  it("accepts a custom touch label", async () => {
    mockPointer(true);
    render(<SearchTrigger label="search or ask" />);

    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent(/search or ask$/));
  });

  it("keeps the label readable to assistive tech even when visually hidden", () => {
    render(<SearchTrigger />);

    expect(screen.getByRole("button")).toHaveAccessibleName("Open search");
  });
});
