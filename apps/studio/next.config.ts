import "@httpjpg/env";
import type { NextConfig } from "next";

export default (): NextConfig => ({
  transpilePackages: ["@httpjpg/ui", "@httpjpg/tokens", "@httpjpg/env", "@httpjpg/storyblok-utils"],
  turbopack: {
    resolveAlias: {
      "styled-system": "../../packages/ui/styled-system",
    },
  },
  reactStrictMode: true,
  // No generated AGENTS.md per app; the root one is the guide.
  agentRules: false,
});
