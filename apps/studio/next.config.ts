import type { NextConfig } from "next";

export default (): NextConfig => ({
  transpilePackages: ["@httpjpg/ui", "@httpjpg/tokens", "@httpjpg/env", "@httpjpg/storyblok-utils"],
  turbopack: {
    resolveAlias: {
      "styled-system": "../../packages/ui/styled-system",
    },
  },
  reactStrictMode: true,
});
