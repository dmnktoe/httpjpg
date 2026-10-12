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
  // The root AGENTS.md is the one guide; `next dev` would add its own.
  agentRules: false,
});
