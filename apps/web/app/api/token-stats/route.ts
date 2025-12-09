import {
  borderRadius,
  colors,
  opacity,
  shadows,
  sizes,
  spacing,
  typography,
} from "@httpjpg/tokens";
import { NextResponse } from "next/server";

/**
 * Token Stats API Route
 * Returns dynamic statistics about design tokens
 */
export async function GET() {
  try {
    // Count color palettes (exclude black/white, count objects)
    const colorPalettes = Object.keys(colors).filter(
      (key) => typeof colors[key as keyof typeof colors] === "object",
    ).length;

    // Count typography families
    const typographyFamilies = Object.keys(typography).length;

    // Count all tokens
    const tokenCount =
      colorPalettes +
      typographyFamilies +
      Object.keys(spacing).length +
      Object.keys(opacity).length +
      Object.keys(shadows).length +
      Object.keys(sizes.icon || {}).length +
      Object.keys(sizes.indicator || {}).length +
      Object.keys(borderRadius).length;

    return NextResponse.json({
      colors: `${colorPalettes} palettes`,
      typography: `${typographyFamilies} families`,
      tokens: `${tokenCount}+`,
    });
  } catch (error) {
    console.error("Token stats error:", error);
    return NextResponse.json(
      {
        colors: "7 palettes",
        typography: "4 families",
        tokens: "100+",
      },
      { status: 200 }, // Return fallback data instead of error
    );
  }
}
