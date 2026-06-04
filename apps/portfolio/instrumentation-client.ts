import { initSentryClient, onRouterTransitionStart } from "@httpjpg/observability/sentry/client.ts";

initSentryClient();

export { onRouterTransitionStart };
