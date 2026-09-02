import { OPEN_SEARCH_EVENT } from "@httpjpg/ui";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();

const mockPathname = vi.fn(() => "/");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname(),
}));

import { AskWidget } from "./ask-widget";

const SEARCH_PAYLOAD = {
  results: [
    { id: "1", title: "Brutalist Portfolio", href: "/work/brutalist", kind: "work" },
    { id: "2", title: "External Thing", href: "https://example.com/thing", kind: "work" },
  ],
  suggestions: ["Brutalist Portfolio"],
};

function ndjson(lines: unknown[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(`${JSON.stringify(line)}\n`));
      }
      controller.close();
    },
  });
}

interface FetchRoutes {
  search?: unknown;
  searchOk?: boolean;
  askBody?: ReadableStream<Uint8Array> | null;
  askOk?: boolean;
  askStatus?: number;
}

function mockFetch(routes: FetchRoutes = {}) {
  const fetchMock = vi.fn(async (url: string) => {
    if (String(url).startsWith("/api/ask")) {
      return {
        ok: routes.askOk ?? true,
        status: routes.askStatus ?? 200,
        body: routes.askBody === undefined ? ndjson([]) : routes.askBody,
      };
    }
    return {
      ok: routes.searchOk ?? true,
      status: 200,
      json: async () => routes.search ?? SEARCH_PAYLOAD,
    };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function openPalette() {
  fireEvent.keyDown(window, { key: "k", metaKey: true });
}

async function type(value: string) {
  fireEvent.change(screen.getByRole("combobox"), { target: { value } });
  await waitFor(() => expect(screen.getByRole("combobox")).toHaveValue(value));
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPathname.mockReturnValue("/");
  mockFetch();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AskWidget", () => {
  it("stays closed until the keyboard shortcut fires", () => {
    render(<AskWidget />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    openPalette();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens when the header trigger asks it to", () => {
    render(<AskWidget />);

    fireEvent(window, new CustomEvent(OPEN_SEARCH_EVENT));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("stays open when the trigger fires again", () => {
    render(<AskWidget />);

    fireEvent(window, new CustomEvent(OPEN_SEARCH_EVENT));
    fireEvent(window, new CustomEvent(OPEN_SEARCH_EVENT));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes itself when the route changes underneath it", () => {
    const { rerender } = render(<AskWidget />);
    openPalette();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    mockPathname.mockReturnValue("/work/brutalist");
    rerender(<AskWidget />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("toggles closed on a second shortcut press", () => {
    render(<AskWidget />);

    openPalette();
    openPalette();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("searches as the user types and renders the results and suggestions", async () => {
    render(<AskWidget />);
    openPalette();

    await type("brutal");

    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2));
    expect(screen.getAllByRole("option")[0]).toHaveTextContent("Brutalist Portfolio");
    expect(screen.getByRole("button", { name: "Brutalist Portfolio" })).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/search?q=brutal",
      expect.objectContaining({ signal: expect.anything() }),
    );
  });

  it("does not search on a blank query", async () => {
    render(<AskWidget />);
    openPalette();

    await type("   ");

    await waitFor(() => expect(screen.getByText("type to search")).toBeInTheDocument());
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("clears results when the search request fails", async () => {
    mockFetch({ searchOk: false });
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<AskWidget />);
    openPalette();

    await type("brutal");

    await waitFor(() => expect(screen.getByText("no matches")).toBeInTheDocument());
  });

  it("routes to an internal result and closes", async () => {
    render(<AskWidget />);
    openPalette();
    await type("brutal");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2));

    fireEvent.mouseDown(screen.getAllByRole("option")[0]);

    expect(mockPush).toHaveBeenCalledWith("/work/brutalist");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens an external result in a new tab instead of routing", async () => {
    const open = vi.fn();
    vi.stubGlobal("open", open);
    mockFetch();
    render(<AskWidget />);
    openPalette();
    await type("brutal");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2));

    fireEvent.mouseDown(screen.getAllByRole("option")[1]);

    expect(open).toHaveBeenCalledWith("https://example.com/thing", "_blank", "noopener,noreferrer");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("streams an answer with its sources", async () => {
    mockFetch({
      askBody: ndjson([
        { type: "sources", sources: [{ title: "Brutalist Portfolio", href: "/work/brutalist" }] },
        { type: "delta", text: "It is " },
        { type: "delta", text: "a portfolio." },
      ]),
    });
    render(<AskWidget />);
    openPalette();
    await type("what is this?");
    await waitFor(() => expect(screen.getByRole("button", { name: /ask/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /ask/i }));

    await waitFor(() => expect(screen.getByText("It is a portfolio.")).toBeInTheDocument());
    expect(screen.getByRole("link", { name: /Brutalist Portfolio/ })).toBeInTheDocument();
  });

  it("surfaces a busy model as a retryable message", async () => {
    mockFetch({ askBody: ndjson([{ type: "error", error: "ai_busy" }]) });
    render(<AskWidget />);
    openPalette();
    await type("what is this?");
    await waitFor(() => expect(screen.getByRole("button", { name: /ask/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /ask/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/busy/i));
  });

  it("explains a 503 as an unconfigured deployment", async () => {
    mockFetch({ askOk: false, askStatus: 503, askBody: null });
    render(<AskWidget />);
    openPalette();
    await type("what is this?");
    await waitFor(() => expect(screen.getByRole("button", { name: /ask/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /ask/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/not available on this deployment/i),
    );
  });

  it("reports a generic failure for other error statuses", async () => {
    mockFetch({ askOk: false, askStatus: 500, askBody: null });
    render(<AskWidget />);
    openPalette();
    await type("what is this?");
    await waitFor(() => expect(screen.getByRole("button", { name: /ask/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /ask/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/answer failed/i));
  });

  it("clears a stale answer when the query changes", async () => {
    mockFetch({ askBody: ndjson([{ type: "delta", text: "old answer" }]) });
    render(<AskWidget />);
    openPalette();
    await type("what is this?");
    await waitFor(() => expect(screen.getByRole("button", { name: /ask/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /ask/i }));
    await waitFor(() => expect(screen.getByText("old answer")).toBeInTheDocument());

    await type("something else");

    await waitFor(() => expect(screen.queryByText("old answer")).not.toBeInTheDocument());
  });

  it("hides the ask affordance when AI is disabled but keeps searching", async () => {
    render(<AskWidget askEnabled={false} />);
    openPalette();

    await type("brutal");

    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2));
    expect(screen.queryByRole("button", { name: /ask/i })).not.toBeInTheDocument();
  });

  it("toggles with Ctrl+K and follows a cited action", async () => {
    mockFetch({
      askBody: ndjson([
        { type: "delta", text: "See this." },
        {
          type: "action",
          action: {
            type: "navigate",
            href: "/work/brutalist",
            title: "Brutalist Portfolio",
            kind: "work",
          },
        },
      ]),
    });
    render(<AskWidget />);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await type("what is this?");
    await waitFor(() => expect(screen.getByRole("button", { name: /ask/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /ask/i }));
    await waitFor(() => expect(screen.getByText("See this.")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /go to Brutalist Portfolio/ }));
    expect(mockPush).toHaveBeenCalledWith("/work/brutalist");
  });

  it("treats a missing search payload as empty and reports a thrown ask", async () => {
    mockFetch({ search: {} });
    render(<AskWidget />);
    openPalette();
    await type("brutal");
    await waitFor(() => expect(screen.getByText("no matches")).toBeInTheDocument());

    mockFetch({
      askOk: true,
      askBody: ndjson([{ type: "error", error: "nope" }]),
    });
    await type("what is this?");
    await waitFor(() => expect(screen.getByRole("button", { name: /ask/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /ask/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/answer failed/i));
  });

  it("reports a network failure from ask", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).startsWith("/api/ask")) {
        throw new Error("offline");
      }
      return { ok: true, status: 200, json: async () => SEARCH_PAYLOAD };
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<AskWidget />);
    openPalette();
    await type("what is this?");
    await waitFor(() => expect(screen.getByRole("button", { name: /ask/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /ask/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/answer failed/i));
  });

  it("applies a suggestion and ignores an aborted in-flight search", async () => {
    render(<AskWidget />);
    openPalette();
    await type("brutal");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Brutalist Portfolio" })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Brutalist Portfolio" }));
    expect(screen.getByRole("combobox")).toHaveValue("Brutalist Portfolio");

    let resolveSearch: ((value: unknown) => void) | undefined;
    const pending = new Promise((resolve) => {
      resolveSearch = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => pending),
    );
    await type("later");
    openPalette();
    resolveSearch?.({
      ok: true,
      status: 200,
      json: async () => SEARCH_PAYLOAD,
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
