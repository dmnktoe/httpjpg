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

  // Rewrites to make URLs cleaner (remove portfolio folder from URL)
  async rewrites() {
    const mainFolder = process.env.NEXT_PUBLIC_STORYBLOK_MAIN_FOLDER;

    if (!mainFolder) {
      return [];
    }

    return [
      {
        source: `/${mainFolder}/:path*`,
        destination: "/:path*",
      },
    ];
  },

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
