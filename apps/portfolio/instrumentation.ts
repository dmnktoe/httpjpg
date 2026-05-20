export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initSentryServer } = await import("@httpjpg/observability/sentry/server.ts");
    initSentryServer();
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const { initSentryEdge } = await import("@httpjpg/observability/sentry/edge.ts");
    initSentryEdge();
  }
}

export async function onRequestError(err: unknown) {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { captureServerException } = await import("@httpjpg/observability/sentry/server.ts");
    captureServerException(err);
  } else if (process.env.NEXT_RUNTIME === "edge") {
    const { captureEdgeException } = await import("@httpjpg/observability/sentry/edge.ts");
    captureEdgeException(err);
  }
}
