import { execSync } from "node:child_process";

import { codecovNextJSWebpackPlugin } from "@codecov/nextjs-webpack-plugin";
import "@httpjpg/env";
import type { NextConfig } from "next";

const GITHUB_REPO = "dmnktoe/httpjpg";

async function fetchLatestReleaseTag(): Promise<string | undefined> {
  try {
    const headers: Record<string, string> = {
      "User-Agent": "httpjpg-build",
      Accept: "application/vnd.github+json",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return undefined;
    const json = (await res.json()) as { tag_name?: string };
    return json.tag_name;
  } catch {
    return undefined;
  }
}

async function resolveAppVersion(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_VERSION) {
    return process.env.NEXT_PUBLIC_APP_VERSION;
  }
  try {
    const tag = execSync("git describe --tags --abbrev=0", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (tag) return tag;
  } catch {
    // no local tags available — try GitHub API
  }
  const releaseTag = await fetchLatestReleaseTag();
  if (releaseTag) return releaseTag;
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  if (process.env.SOURCE_COMMIT) return process.env.SOURCE_COMMIT;
  if (process.env.COOLIFY_GIT_COMMIT_SHA) return process.env.COOLIFY_GIT_COMMIT_SHA;
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "dev";
  }
}

export default async (): Promise<NextConfig> => {
  const config: NextConfig = {
    transpilePackages: [
      "@httpjpg/ui",
      "@httpjpg/tokens",
      "@httpjpg/env",
      "@httpjpg/storyblok-api",
      "@httpjpg/storyblok-utils",
    ],

    env: {
      NEXT_PUBLIC_APP_VERSION: await resolveAppVersion(),
    },

    images: {
      formats: ["image/avif", "image/webp"],
      remotePatterns: [
        { protocol: "https", hostname: "a.storyblok.com" },
        { protocol: "https", hostname: "a2.storyblok.com" },
      ],
    },

    reactStrictMode: true,
    productionBrowserSourceMaps: true,

    async rewrites() {
      return [
        { source: "/draft", destination: "/api/draft" },
        { source: "/exit-draft", destination: "/api/exit-draft" },
      ];
    },

    turbopack: {
      resolveAlias: {
        "styled-system": "../../packages/ui/styled-system",
      },
    },
  };

  if (process.env.ANALYZE_BUNDLE === "true") {
    config.webpack = (webpackConfig, options) => {
      webpackConfig.plugins.push(
        codecovNextJSWebpackPlugin({
          enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
          bundleName: "portfolio",
          uploadToken: process.env.CODECOV_TOKEN,
          webpack: options.webpack,
        }),
      );
      return webpackConfig;
    };
  }

  return config;
};
