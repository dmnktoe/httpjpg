import "@httpjpg/env";
import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@httpjpg/ui",
    "@httpjpg/tokens",
    "@httpjpg/env",
    "@httpjpg/storyblok-api",
    "@httpjpg/storyblok-utils",
  ],

  // Image optimization for Storyblok assets
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.storyblok.com",
      },
      {
        protocol: "https",
        hostname: "a2.storyblok.com",
      },
    ],
  },

  // React Strict Mode for better error detection
  reactStrictMode: true,

  // Generate source maps for production (required for Sentry)
  productionBrowserSourceMaps: true,

  webpack: (config, { dev }) => {
    // Suppress all warnings in development
    if (dev) {
      config.infrastructureLogging = {
        level: "error",
      };

      // Ignore specific warnings from OpenTelemetry/Sentry
      config.ignoreWarnings = [
        { module: /node_modules\/@opentelemetry/ },
        { module: /node_modules\/@sentry/ },
        /Critical dependency: the request of a dependency is an expression/,
      ];
    }

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
