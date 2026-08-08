import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { VisitorCounter } from "./visitor-counter";

function mockFetch(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({ ok, json: async () => payload });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("VisitorCounter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("holds a loading label, then collapses when the payload has no counts", async () => {
    mockFetch({});
    const { container } = render(<VisitorCounter />);

    expect(screen.getByText("loading ...")).toBeInTheDocument();
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("zero-pads the visitor count and formats the pageviews", async () => {
    mockFetch({ visitors: 567, pageviews: 1234 });
    render(<VisitorCounter />);

    expect(await screen.findByText("000567")).toBeInTheDocument();
    expect(screen.getByText("1,234 views")).toBeInTheDocument();
  });

  it("labels the counter for screen readers", async () => {
    mockFetch({ visitors: 42, pageviews: 100 });
    render(<VisitorCounter />);

    expect(await screen.findByLabelText("42 visitors")).toBeInTheDocument();
  });

  it("keeps six digits once the count grows past the pad width", async () => {
    mockFetch({ visitors: 1234567, pageviews: 2000000 });
    render(<VisitorCounter />);

    expect(await screen.findByText("1234567")).toBeInTheDocument();
  });

  it("renders nothing when the request fails", async () => {
    mockFetch({}, false);
    const { container } = render(<VisitorCounter />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders nothing when the request throws", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(<VisitorCounter />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
