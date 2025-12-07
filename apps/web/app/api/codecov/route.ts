import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const revalidate = 60;

export async function GET(_request: NextRequest) {
  try {
    // Fetch the SVG badge and parse coverage percentage from it
    const response = await fetch(
      "https://codecov.io/gh/dmnktoe/httpjpg/branch/main/graph/badge.svg?token=oaz54rPTwU",
      {
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Codecov data" },
        { status: response.status },
      );
    }

    const svgText = await response.text();

    // Parse coverage percentage from SVG text content
    // The SVG contains text like: <text x="93" y="14">7%</text>
    const match = svgText.match(/<text x="93" y="14">(\d+(?:\.\d+)?)%<\/text>/);
    const coverage = match ? Number.parseFloat(match[1]) : 0;

    return NextResponse.json({
      coverage,
      url: "https://codecov.io/gh/dmnktoe/httpjpg",
    });
  } catch (error) {
    console.error("Error fetching Codecov data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
