import arcjet, { detectBot, fixedWindow, shield } from "@arcjet/next";
import { env } from "@httpjpg/env";

const isDevelopment = env.NODE_ENV === "development";
const mode = isDevelopment ? "DRY_RUN" : "LIVE";

/**
 * Main Arcjet instance with default protections
 */
export const aj = arcjet({
  key: env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    // Shield provides automatic protection against common attacks
    shield({
      mode,
    }),
    // Bot detection
    detectBot({
      mode,
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Allow Google, Bing, etc.
        "CATEGORY:PREVIEW", // Allow social media preview bots
        "CATEGORY:MONITOR", // Allow uptime monitors
      ],
    }),
    // Global rate limit
    fixedWindow({
      mode,
      window: "1m",
      max: 60, // 60 requests per minute per IP
    }),
  ],
});

/**
 * Strict rate limiting for API routes
 */
export const ajApi = arcjet({
  key: env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode }),
    detectBot({
      mode,
      allow: [], // No bots allowed on API routes
    }),
    fixedWindow({
      mode,
      window: "1m",
      max: 10, // 10 requests per minute per IP for APIs
    }),
  ],
});

/**
 * Very strict rate limiting for webhooks (Storyblok, etc.)
 */
export const ajWebhook = arcjet({
  key: env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode }),
    fixedWindow({
      mode,
      window: "1m",
      max: 5, // 5 requests per minute per IP for webhooks
    }),
  ],
});

export { arcjet, shield, detectBot, fixedWindow };
