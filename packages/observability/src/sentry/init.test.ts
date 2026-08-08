// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const sentryConfig = vi.hoisted(() => ({
  value: {
    dsn: "https://key@sentry.io/1" as string | undefined,
    environment: "production" as string | undefined,
    release: "v1.0.0" as string | undefined,
    isProduction: true,
    isEnabled: true,
  },
}));

vi.mock("./config", () => ({ getSentryConfig: () => sentryConfig.value }));

vi.mock("@sentry/nextjs", () => ({
  init: vi.fn(),
  getClient: vi.fn(() => undefined),
  captureException: vi.fn(),
  captureRouterTransitionStart: vi.fn(),
  withScope: vi.fn(),
}));

import * as Sentry from "@sentry/nextjs";

import { initSentryClient } from "./client";
import { initSentryEdge } from "./edge";
import { initSentryServer } from "./server";

const INITIALIZERS = [
  ["client", initSentryClient],
  ["server", initSentryServer],
  ["edge", initSentryEdge],
] as const;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(Sentry.getClient).mockReturnValue(undefined);
  sentryConfig.value = {
    dsn: "https://key@sentry.io/1",
    environment: "production",
    release: "v1.0.0",
    isProduction: true,
    isEnabled: true,
  };
});

describe.each(INITIALIZERS)("initSentry%s", (scope, init) => {
  it("initialises Sentry with the resolved runtime config", () => {
    init();

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://key@sentry.io/1",
        environment: "production",
        release: "v1.0.0",
        enabled: true,
      }),
    );
  });

  it("does nothing without a DSN", () => {
    sentryConfig.value = { ...sentryConfig.value, dsn: undefined };

    init();

    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it("does nothing when the scope is disabled", () => {
    sentryConfig.value = { ...sentryConfig.value, isEnabled: false };

    init();

    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it("does nothing when a client already exists", () => {
    vi.mocked(Sentry.getClient).mockReturnValue({} as never);

    init();

    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it("samples fewer traces in production than outside it", () => {
    init();
    const production = vi.mocked(Sentry.init).mock.calls[0][0]?.tracesSampleRate;

    vi.clearAllMocks();
    sentryConfig.value = { ...sentryConfig.value, isProduction: false };
    init();
    const development = vi.mocked(Sentry.init).mock.calls[0][0]?.tracesSampleRate;

    expect(production).toBeLessThan(development as number);
    expect(development).toBe(1.0);
    expect(scope).toBeTypeOf("string");
  });
});

describe("initSentryClient", () => {
  it("attaches the user agent to requests in beforeSend", () => {
    vi.stubGlobal("navigator", { userAgent: "test-agent" });
    initSentryClient();
    const beforeSend = vi.mocked(Sentry.init).mock.calls[0][0]?.beforeSend;

    const event = { request: { headers: { Accept: "text/html" } } };
    const result = beforeSend?.(event as never, {} as never);

    expect(result).toMatchObject({
      request: { headers: { Accept: "text/html", "User-Agent": "test-agent" } },
    });
    vi.unstubAllGlobals();
  });

  it("leaves events without a request untouched", () => {
    initSentryClient();
    const beforeSend = vi.mocked(Sentry.init).mock.calls[0][0]?.beforeSend;

    const event = { message: "hi" };

    expect(beforeSend?.(event as never, {} as never)).toBe(event);
  });

  it("samples replays more aggressively outside production", () => {
    // The mocked init() accepts the union of all runtime option shapes, so the
    // browser-only replay keys need a narrowing cast.
    const replayRate = () =>
      (vi.mocked(Sentry.init).mock.calls[0][0] as { replaysSessionSampleRate?: number })
        ?.replaysSessionSampleRate;

    initSentryClient();
    expect(replayRate()).toBe(0.01);

    vi.clearAllMocks();
    sentryConfig.value = { ...sentryConfig.value, isProduction: false };
    initSentryClient();
    expect(replayRate()).toBe(0.1);
  });
});

describe("initSentryServer", () => {
  it("tags events with the Node.js runtime", () => {
    initSentryServer();
    const beforeSend = vi.mocked(Sentry.init).mock.calls[0][0]?.beforeSend;

    const result = beforeSend?.({ contexts: { trace: {} } } as never, {} as never);

    expect(result).toMatchObject({
      contexts: { trace: {}, runtime: { name: "Node.js", version: process.version } },
    });
  });
});

describe("initSentryEdge", () => {
  it("tags events with the Edge runtime", () => {
    initSentryEdge();
    const beforeSend = vi.mocked(Sentry.init).mock.calls[0][0]?.beforeSend;

    const result = beforeSend?.({} as never, {} as never);

    expect(result).toMatchObject({ contexts: { runtime: { name: "Edge" } } });
  });
});
