export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initSentryServer } = await import("@httpjpg/observability/sentry");
    initSentryServer();
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const { initSentryEdge } = await import("@httpjpg/observability/sentry");
    initSentryEdge();
  }
}

export async function onRequestError(err: unknown) {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { captureServerException } = await import(
      "@httpjpg/observability/sentry"
    );
    captureServerException(err);
  } else if (process.env.NEXT_RUNTIME === "edge") {
    const { captureEdgeException } = await import(
      "@httpjpg/observability/sentry"
    );
    captureEdgeException(err);
  }
}
