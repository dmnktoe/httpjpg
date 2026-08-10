import { fireEvent, render, screen } from "@testing-library/react";

import {
  CommandPalette,
  type CommandPaletteProps,
  type CommandPaletteResult,
} from "./command-palette";

const RESULTS: CommandPaletteResult[] = [
  {
    id: "1",
    title: "Brutalist Portfolio",
    href: "/work/brutalist",
    kind: "work",
    excerpt: "Stark",
  },
  { id: "2", title: "Poster Series", href: "/work/posters", kind: "work" },
  { id: "3", title: "About", href: "/about", kind: "page" },
];

function setup(overrides: Partial<CommandPaletteProps> = {}) {
  const props: CommandPaletteProps = {
    open: true,
    query: "poster",
    results: RESULTS,
    onQueryChange: vi.fn(),
    onClose: vi.fn(),
    onSelect: vi.fn(),
    onAsk: vi.fn(),
    ...overrides,
  };
  render(<CommandPalette {...props} />);
  return props;
}

function input(): HTMLElement {
  return screen.getByRole("combobox");
}

describe("CommandPalette", () => {
  it("renders nothing when closed", () => {
    setup({ open: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders each result as an option", () => {
    setup();

    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(screen.getByText("Brutalist Portfolio")).toBeInTheDocument();
  });

  it("shows the result excerpt when there is one", () => {
    setup();

    expect(screen.getByText("Stark")).toBeInTheDocument();
  });

  it("reports the match count", () => {
    setup();

    expect(screen.getByText("3 matches")).toBeInTheDocument();
  });

  it("uses the singular label for one match", () => {
    setup({ results: [RESULTS[0]] });

    expect(screen.getByText("1 match")).toBeInTheDocument();
  });

  it("prompts for input when the query is empty", () => {
    setup({ query: "", results: [] });

    expect(screen.getByText("type to search")).toBeInTheDocument();
  });

  it("says so when a query matches nothing", () => {
    setup({ results: [] });

    expect(screen.getByText("no matches")).toBeInTheDocument();
  });

  it("reports the searching and answering states", () => {
    const { unmount } = render(
      <CommandPalette
        open
        query="q"
        results={[]}
        status="searching"
        onQueryChange={vi.fn()}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        onAsk={vi.fn()}
      />,
    );
    expect(screen.getByText("searching…")).toBeInTheDocument();
    unmount();

    setup({ status: "answering" });
    expect(screen.getByText("thinking…")).toBeInTheDocument();
  });

  it("forwards typing to onQueryChange", () => {
    const props = setup();

    fireEvent.change(input(), { target: { value: "brutal" } });

    expect(props.onQueryChange).toHaveBeenCalledWith("brutal");
  });

  it("closes on Escape", () => {
    const props = setup();

    fireEvent.keyDown(input(), { key: "Escape" });

    expect(props.onClose).toHaveBeenCalled();
  });

  it("closes on Escape when focus sits outside the input", () => {
    const props = setup({ suggestions: ["Poster Series"] });

    fireEvent.keyDown(screen.getByRole("button", { name: "Poster Series" }), { key: "Escape" });

    expect(props.onClose).toHaveBeenCalled();
  });

  it("keeps Tab inside the dialog, wrapping both ways", () => {
    setup({ suggestions: ["Poster Series"] });
    const dialog = screen.getByRole("dialog");
    const stops = Array.from(dialog.querySelectorAll("a[href], button, input"));
    const first = stops[0] as HTMLElement;
    const last = stops[stops.length - 1] as HTMLElement;

    last.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("leaves Tab alone in the middle of the dialog", () => {
    setup({ suggestions: ["Poster Series"] });
    const dialog = screen.getByRole("dialog");
    const suggestion = screen.getByRole("button", { name: "Poster Series" });

    suggestion.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });

    expect(document.activeElement).toBe(suggestion);
  });

  it("focuses the input on open and restores focus on close", () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();

    const { rerender } = render(
      <CommandPalette
        open
        query="poster"
        results={RESULTS}
        onQueryChange={vi.fn()}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        onAsk={vi.fn()}
      />,
    );
    expect(document.activeElement).toBe(screen.getByRole("combobox"));

    rerender(
      <CommandPalette
        open={false}
        query="poster"
        results={RESULTS}
        onQueryChange={vi.fn()}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        onAsk={vi.fn()}
      />,
    );

    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("closes when the backdrop is clicked but not the dialog", () => {
    const props = setup();

    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(props.onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(screen.getByRole("dialog").parentElement as HTMLElement);
    expect(props.onClose).toHaveBeenCalled();
  });

  it("highlights the first result by default", () => {
    setup();

    expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true");
  });

  it("moves the highlight with the arrow keys and wraps at both ends", () => {
    setup();

    fireEvent.keyDown(input(), { key: "ArrowDown" });
    expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(input(), { key: "ArrowUp" });
    fireEvent.keyDown(input(), { key: "ArrowUp" });
    expect(screen.getAllByRole("option")[2]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(input(), { key: "ArrowDown" });
    expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true");
  });

  it("follows the pointer when hovering a result", () => {
    setup();

    fireEvent.mouseEnter(screen.getAllByRole("option")[2]);

    expect(screen.getAllByRole("option")[2]).toHaveAttribute("aria-selected", "true");
  });

  it("selects the highlighted result on Enter", () => {
    const props = setup();

    fireEvent.keyDown(input(), { key: "ArrowDown" });
    fireEvent.keyDown(input(), { key: "Enter" });

    expect(props.onSelect).toHaveBeenCalledWith(RESULTS[1]);
  });

  it("selects a result on click", () => {
    const props = setup();

    fireEvent.mouseDown(screen.getAllByRole("option")[0]);

    expect(props.onSelect).toHaveBeenCalledWith(RESULTS[0]);
  });

  it("asks instead of selecting when Cmd+Enter is used", () => {
    const props = setup();

    fireEvent.keyDown(input(), { key: "Enter", metaKey: true });

    expect(props.onSelect).not.toHaveBeenCalled();
    expect(props.onAsk).toHaveBeenCalledWith("poster");
  });

  it("asks on plain Enter when there are no results", () => {
    const props = setup({ results: [] });

    fireEvent.keyDown(input(), { key: "Enter" });

    expect(props.onAsk).toHaveBeenCalledWith("poster");
  });

  it("does not ask on an empty query", () => {
    const props = setup({ query: "   ", results: [] });

    fireEvent.keyDown(input(), { key: "Enter" });

    expect(props.onAsk).not.toHaveBeenCalled();
  });

  it("hides the ask affordance when AI is disabled", () => {
    setup({ askEnabled: false, results: [] });

    expect(screen.queryByRole("button", { name: /ask/i })).not.toBeInTheDocument();

    fireEvent.keyDown(input(), { key: "Enter" });
  });

  it("asks when the footer button is pressed", () => {
    const props = setup();

    fireEvent.click(screen.getByRole("button", { name: /ask/i }));

    expect(props.onAsk).toHaveBeenCalledWith("poster");
  });
});

describe("CommandPalette clear button", () => {
  it("is hidden while the query is empty", () => {
    setup({ query: "", results: [] });

    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("empties the query and returns focus to the input", () => {
    const props = setup();

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(props.onQueryChange).toHaveBeenCalledWith("");
    expect(document.activeElement).toBe(screen.getByRole("combobox"));
  });
});

describe("CommandPalette body scroll", () => {
  it("freezes the page while open and restores it on close", () => {
    const { rerender } = render(
      <CommandPalette
        open
        query="poster"
        results={RESULTS}
        onQueryChange={vi.fn()}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        onAsk={vi.fn()}
      />,
    );
    expect(document.body.style.position).toBe("fixed");
    expect(document.documentElement.style.overflow).toBe("hidden");

    rerender(
      <CommandPalette
        open={false}
        query="poster"
        results={RESULTS}
        onQueryChange={vi.fn()}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        onAsk={vi.fn()}
      />,
    );

    expect(document.body.style.position).toBe("");
  });
});

describe("CommandPalette suggestions", () => {
  it("renders nothing when there are no suggestions", () => {
    setup();

    expect(screen.queryByText("try")).not.toBeInTheDocument();
  });

  it("renders each suggestion as a button", () => {
    setup({ suggestions: ["Poster Series", "Print"] });

    expect(screen.getByText("try")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Print" })).toBeInTheDocument();
  });

  it("applies a suggestion as the new query", () => {
    const props = setup({ suggestions: ["Poster Series"] });

    fireEvent.click(screen.getByRole("button", { name: "Poster Series" }));

    expect(props.onQueryChange).toHaveBeenCalledWith("Poster Series");
  });
});

describe("CommandPalette answer", () => {
  it("is hidden while idle with no answer", () => {
    setup();

    expect(screen.queryByText("answer")).not.toBeInTheDocument();
  });

  it("renders the answer text and its sources", () => {
    setup({
      answer: "It is a portfolio.",
      sources: [{ title: "Brutalist Portfolio", href: "/work/brutalist" }],
    });

    expect(screen.getByText("It is a portfolio.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Brutalist Portfolio/ })).toHaveAttribute(
      "href",
      "/work/brutalist",
    );
  });

  it("closes when a source link is followed", () => {
    const props = setup({
      answer: "It is a portfolio.",
      sources: [{ title: "Brutalist Portfolio", href: "/work/brutalist" }],
    });

    fireEvent.click(screen.getByRole("link", { name: /Brutalist Portfolio/ }));

    expect(props.onClose).toHaveBeenCalled();
  });

  it("marks the answer busy while streaming", () => {
    setup({ answer: "partial", status: "answering" });

    expect(screen.getByText(/partial/)).toHaveAttribute("aria-busy", "true");
  });

  it("shows the error message instead of the answer", () => {
    setup({ status: "error", errorMessage: "The model is busy." });

    expect(screen.getByRole("alert")).toHaveTextContent("The model is busy.");
  });

  it("falls back to a generic error message", () => {
    setup({ status: "error" });

    expect(screen.getByRole("alert")).toHaveTextContent("The answer failed.");
  });
});

describe("CommandPalette action", () => {
  const ACTION = {
    type: "navigate",
    href: "/work/brutalist",
    title: "Brutalist Portfolio",
    kind: "work",
  } as const;

  it("offers the destination the finished answer points at", () => {
    const props = setup({ answer: "It is the site [1].", action: ACTION, onAction: vi.fn() });

    fireEvent.click(screen.getByRole("button", { name: /go to Brutalist Portfolio/ }));

    expect(props.onAction).toHaveBeenCalledWith(ACTION);
  });

  // The answer is still growing, so the citation it points at can still change.
  it("withholds the action while the answer is streaming", () => {
    setup({ answer: "It is the s", action: ACTION, status: "answering", onAction: vi.fn() });

    expect(screen.queryByRole("button", { name: /go to/ })).not.toBeInTheDocument();
  });

  it("shows no action when the answer failed", () => {
    setup({ status: "error", action: ACTION, onAction: vi.fn() });

    expect(screen.queryByRole("button", { name: /go to/ })).not.toBeInTheDocument();
  });

  it("shows no action when the caller cannot handle one", () => {
    setup({ answer: "It is the site [1].", action: ACTION });

    expect(screen.queryByRole("button", { name: /go to/ })).not.toBeInTheDocument();
  });
});
