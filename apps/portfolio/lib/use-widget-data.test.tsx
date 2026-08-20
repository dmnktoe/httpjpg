import { act, render, screen, waitFor } from "@testing-library/react";

import { useWidgetData } from "./use-widget-data";

interface Payload {
  value: string;
}

function Probe({ url, pollMs, enabled }: { url: string; pollMs?: number; enabled?: boolean }) {
  const { data, loaded } = useWidgetData<Payload>(url, { pollMs, enabled });
  return (
    <output>
      {loaded ? "loaded" : "pending"}:{data?.value ?? "none"}
    </output>
  );
}

function jsonResponse(value: string): Response {
  return { ok: true, json: async () => ({ value }) } as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;
let visibility: DocumentVisibilityState;

beforeEach(() => {
  visibility = "visible";
  vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visibility);
  fetchMock = vi.fn(async () => jsonResponse("first"));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("useWidgetData", () => {
  it("exposes the payload once the first request settles", async () => {
    render(<Probe url="/api/discogs" />);

    expect(screen.getByRole("status")).toHaveTextContent("pending:none");
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("loaded:first"));
    expect(fetchMock).toHaveBeenCalledWith("/api/discogs", expect.anything());
  });

  it("marks itself loaded when the endpoint is off, so the widget can collapse", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 501 } as Response);

    render(<Probe url="/api/discogs" />);

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("loaded:none"));
  });

  it("survives a rejected request without unhandled errors", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));

    render(<Probe url="/api/discogs" />);

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("loaded:none"));
    expect(console.error).toHaveBeenCalled();
  });

  it("skips the request when disabled", async () => {
    render(<Probe url="/api/discogs" enabled={false} />);

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("loaded:none"));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("aborts the in-flight request on unmount", () => {
    const { unmount } = render(<Probe url="/api/discogs" />);
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;

    unmount();

    expect(signal.aborted).toBe(true);
  });

  it("does not poll when no interval is given", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    render(<Probe url="/api/discogs" />);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("re-fetches on the interval", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    render(<Probe url="/api/discord" pollMs={30_000} />);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    fetchMock.mockResolvedValue(jsonResponse("second"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("status")).toHaveTextContent("loaded:second");
  });

  it("does not spend requests on a hidden tab", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    render(<Probe url="/api/discord" pollMs={30_000} />);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    visibility = "hidden";
    await act(async () => {
      await vi.advanceTimersByTimeAsync(90_000);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("catches up as soon as the tab is visible again", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    render(<Probe url="/api/discord" pollMs={30_000} />);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    visibility = "hidden";
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    visibility = "visible";
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
