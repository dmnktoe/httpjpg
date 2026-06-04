// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MockScope {
  setTag: ReturnType<typeof vi.fn>;
  setContext: ReturnType<typeof vi.fn>;
}

const mockScope: MockScope = {
  setTag: vi.fn(),
  setContext: vi.fn(),
};

vi.mock("@sentry/nextjs", () => ({
  withScope: vi.fn((cb: (s: MockScope) => void) => cb(mockScope)),
  captureException: vi.fn(),
}));

import * as Sentry from "@sentry/nextjs";

import { captureServerException } from "./server";

describe("captureServerException", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("captures the error inside a withScope call", () => {
    const error = new Error("test");

    captureServerException(error);

    expect(Sentry.withScope).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it("sets tags on the isolated scope", () => {
    captureServerException(new Error("tagged"), {
      tags: { route: "/api/test", method: "GET" },
    });

    expect(mockScope.setTag).toHaveBeenCalledWith("route", "/api/test");
    expect(mockScope.setTag).toHaveBeenCalledWith("method", "GET");
  });

  it("sets extra context on the isolated scope", () => {
    captureServerException(new Error("extra"), {
      extra: { slug: "my-page", attempt: 3 },
    });

    expect(mockScope.setContext).toHaveBeenCalledWith("custom", {
      slug: "my-page",
      attempt: 3,
    });
  });

  it("works without context", () => {
    const error = new Error("bare");

    captureServerException(error);

    expect(mockScope.setTag).not.toHaveBeenCalled();
    expect(mockScope.setContext).not.toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });
});
