import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

/**
 * Package Versions Stats API Route
 * Returns dynamic statistics about packages and apps
 */
export async function GET() {
  try {
    // Go up from apps/web to monorepo root
    const rootDir = path.resolve(process.cwd(), "../..");
    const rootPackageJson = JSON.parse(
      await fs.readFile(path.join(rootDir, "package.json"), "utf-8"),
    );

    // Count apps (directories in apps/)
    const appsDir = path.join(rootDir, "apps");
    const apps = await fs.readdir(appsDir);
    const appsCount = (
      await Promise.all(
        apps.map(async (app) => {
          const appPath = path.join(appsDir, app);
          const stat = await fs.stat(appPath);
          return stat.isDirectory();
        }),
      )
    ).filter(Boolean).length;

    // Count packages (directories in packages/ with package.json)
    const packagesDir = path.join(rootDir, "packages");
    const packages = await fs.readdir(packagesDir);
    const packagesCount = (
      await Promise.all(
        packages.map(async (pkg) => {
          const pkgPath = path.join(packagesDir, pkg);
          const stat = await fs.stat(pkgPath);
          if (!stat.isDirectory()) {
            return false;
          }
          try {
            await fs.access(path.join(pkgPath, "package.json"));
            return true;
          } catch {
            return false;
          }
        }),
      )
    ).filter(Boolean).length;

    // Get version from root package.json
    const version = rootPackageJson.version || "1.0.0";

    return NextResponse.json({
      apps: appsCount.toString(),
      packages: packagesCount.toString(),
      version: `v${version}`,
    });
  } catch (error) {
    console.error("Package stats error:", error);
    return NextResponse.json(
      {
        apps: "3",
        packages: "13",
        version: "v1.0.0",
      },
      { status: 200 }, // Return fallback data instead of error
    );
  }
}
