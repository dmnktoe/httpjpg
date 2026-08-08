vi.mock("@httpjpg/observability/sentry/client.ts", () => ({
  captureClientException: vi.fn(),
}));

import { captureClientException } from "@httpjpg/observability/sentry/client.ts";
import { fireEvent, render, screen } from "@testing-library/react";

import GlobalError from "./global-error";

// The component renders <html>/<body>, which React refuses to mount inside a
// detached container — render into the document itself instead.
function renderGlobalError(error: Error & { digest?: string }, reset = vi.fn()) {
  return { reset, ...render(<GlobalError error={error} reset={reset} />, { container: document }) };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GlobalError", () => {
  it("reports the error to Sentry as fatal", () => {
    const error = Object.assign(new Error("boom"), { digest: "abc123" });

    renderGlobalError(error);

    expect(captureClientException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        level: "fatal",
        tags: { errorBoundary: "global", digest: "abc123" },
      }),
    );
  });

  it("passes the error details as context", () => {
    const error = new Error("kaputt");

    renderGlobalError(error);

    expect(captureClientException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        contexts: { error: { name: "Error", message: "kaputt", stack: error.stack } },
      }),
    );
  });

  it("renders the fallback copy", () => {
    renderGlobalError(new Error("boom"));

    expect(screen.getByRole("heading", { name: "Something went wrong!" })).toBeInTheDocument();
    expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument();
  });

  it("calls reset when the retry button is pressed", () => {
    const { reset } = renderGlobalError(new Error("boom"));

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(reset).toHaveBeenCalledOnce();
  });
});
