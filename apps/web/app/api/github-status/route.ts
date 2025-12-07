import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 60; // Cache for 60 seconds

/**
 * GitHub Actions Status API
 * Fetches the latest workflow run status for CI
 */
export async function GET() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/dmnktoe/httpjpg/actions/workflows/ci.yml/runs?per_page=1",
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(process.env.GH_TOKEN && {
            Authorization: `Bearer ${process.env.GH_TOKEN}`,
          }),
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const latestRun = data.workflow_runs[0];

    if (!latestRun) {
      return NextResponse.json(
        { error: "No workflow runs found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: latestRun.conclusion || latestRun.status, // "success", "failure", "in_progress", etc.
      name: latestRun.name,
      event: latestRun.event,
      branch: latestRun.head_branch,
      commit: latestRun.head_sha.substring(0, 7),
      created_at: latestRun.created_at,
      updated_at: latestRun.updated_at,
      html_url: latestRun.html_url,
    });
  } catch (error) {
    console.error("Failed to fetch GitHub Actions status:", error);
    return NextResponse.json(
      { error: "Failed to fetch CI status" },
      { status: 500 },
    );
  }
}
