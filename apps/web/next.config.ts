import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@httpjpg/ui", "@httpjpg/tokens"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "styled-system": path.resolve(
        __dirname,
        "../../packages/ui/styled-system",
      ),
    };
    return config;
  },
};

export default nextConfig;
