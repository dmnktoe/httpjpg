import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  changelog: string;
}

export async function GET() {
  try {
    const rootDir = path.join(process.cwd(), "../..");

    const packageDirs = [
      {
        path: "packages/ui",
        name: "@httpjpg/ui",
        description: "Core UI component library with Panda CSS",
      },
      {
        path: "packages/storyblok-ui",
        name: "@httpjpg/storyblok-ui",
        description: "Storyblok-specific UI components",
      },
      {
        path: "packages/storyblok-api",
        name: "@httpjpg/storyblok-api",
        description: "Storyblok API client with caching",
      },
      {
        path: "packages/storyblok-richtext",
        name: "@httpjpg/storyblok-richtext",
        description: "Rich text renderer for Storyblok",
      },
      {
        path: "packages/storyblok-utils",
        name: "@httpjpg/storyblok-utils",
        description: "Storyblok utilities and helpers",
      },
      {
        path: "packages/storyblok-sync",
        name: "@httpjpg/storyblok-sync",
        description: "Storyblok component sync utility",
      },
      {
        path: "packages/analytics",
        name: "@httpjpg/analytics",
        description: "Analytics and tracking utilities",
      },
      {
        path: "packages/consent",
        name: "@httpjpg/consent",
        description: "Cookie consent management",
      },
      {
        path: "packages/observability",
        name: "@httpjpg/observability",
        description: "Datadog RUM and Logs integration",
      },
      {
        path: "packages/security",
        name: "@httpjpg/security",
        description: "Security utilities and Arcjet integration",
      },
      {
        path: "packages/now-playing",
        name: "@httpjpg/now-playing",
        description: "Spotify Now Playing integration",
      },
      {
        path: "packages/tokens",
        name: "@httpjpg/tokens",
        description: "Design tokens",
      },
      {
        path: "packages/env",
        name: "@httpjpg/env",
        description: "Environment variable validation",
      },
    ];

    const packages: PackageInfo[] = [];

    for (const pkg of packageDirs) {
      try {
        const changelogPath = path.join(rootDir, pkg.path, "CHANGELOG.md");
        const packageJsonPath = path.join(rootDir, pkg.path, "package.json");

        let changelog = "No changelog available";
        let version = "1.0.0";

        try {
          changelog = await fs.readFile(changelogPath, "utf-8");
        } catch {
          // Changelog doesn't exist
        }

        try {
          const packageJson = JSON.parse(
            await fs.readFile(packageJsonPath, "utf-8"),
          );
          version = packageJson.version || "1.0.0";
        } catch {
          // Package.json doesn't exist
        }

        packages.push({
          name: pkg.name,
          version,
          description: pkg.description,
          changelog,
        });
      } catch (error) {
        console.error(`Error reading ${pkg.name}:`, error);
      }
    }

    const appDirs = [
      {
        path: "apps/web",
        name: "@httpjpg/web",
        description: "Main portfolio web application",
      },
      {
        path: "apps/docs",
        name: "@httpjpg/docs",
        description: "Documentation site",
      },
      {
        path: "apps/storybook",
        name: "@httpjpg/storybook",
        description: "Component library showcase",
      },
    ];

    const apps: PackageInfo[] = [];

    for (const app of appDirs) {
      try {
        const changelogPath = path.join(rootDir, app.path, "CHANGELOG.md");
        const packageJsonPath = path.join(rootDir, app.path, "package.json");

        let changelog = "No changelog available";
        let version = "1.0.0";

        try {
          changelog = await fs.readFile(changelogPath, "utf-8");
        } catch {
          // Changelog doesn't exist
        }

        try {
          const packageJson = JSON.parse(
            await fs.readFile(packageJsonPath, "utf-8"),
          );
          version = packageJson.version || "1.0.0";
        } catch {
          // Package.json doesn't exist
        }

        apps.push({
          name: app.name,
          version,
          description: app.description,
          changelog,
        });
      } catch (error) {
        console.error(`Error reading ${app.name}:`, error);
      }
    }

    // Sort alphabetically by name
    apps.sort((a, b) => a.name.localeCompare(b.name));
    packages.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ apps, packages });
  } catch (error) {
    console.error("Error reading package data:", error);
    return NextResponse.json(
      { error: "Failed to read package data" },
      { status: 500 },
    );
  }
}
