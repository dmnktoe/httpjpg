// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MockScope {
  setContext: ReturnType<typeof vi.fn>;
}

const mockScope: MockScope = {
  setContext: vi.fn(),
};

vi.mock("@sentry/nextjs", () => ({
  withScope: vi.fn((cb: (s: MockScope) => void) => cb(mockScope)),
  captureException: vi.fn(),
}));

import * as Sentry from "@sentry/nextjs";

import { captureEdgeException } from "./edge";

describe("captureEdgeException", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("captures the error inside a withScope call", () => {
    const error = new Error("edge-error");

    captureEdgeException(error);

    expect(Sentry.withScope).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it("sets context on the isolated scope", () => {
    captureEdgeException(new Error("ctx"), { pathname: "/test", method: "GET" });

    expect(mockScope.setContext).toHaveBeenCalledWith("custom", {
      pathname: "/test",
      method: "GET",
    });
  });

  it("works without context", () => {
    const error = new Error("bare");

    captureEdgeException(error);

    expect(mockScope.setContext).not.toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });
});
