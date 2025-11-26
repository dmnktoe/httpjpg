/**
 * Extract vibrant color from album artwork
 * Uses colorthief library for color extraction
 */

"use client";

import ColorThief from "colorthief";

export interface ExtractedColor {
  rgb: string;
  rgba: string;
  /** Recommended text color for contrast: "black" or "white" */
  textColor: "black" | "white";
}

/**
 * Extract the most vibrant/dominant color from an image URL
 *
 * @param imageUrl - URL of the image to analyze
 * @returns Promise with RGB and RGBA color strings
 *
 * @example
 * ```tsx
 * const color = await extractVibrantColor(artwork);
 * <NowPlaying vibrantColor={color.rgba} />
 * ```
 */
export async function extractVibrantColor(
  imageUrl: string,
): Promise<ExtractedColor | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const [r, g, b] = colorThief.getColor(img);

        // Calculate relative luminance (WCAG formula)
        // https://www.w3.org/WAI/GL/wiki/Relative_luminance
        const luminance =
          0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);

        // Use white text for dark colors, black text for light colors
        const textColor = luminance > 0.5 ? "black" : "white";

        resolve({
          rgb: `rgb(${r}, ${g}, ${b})`,
          rgba: `rgba(${r}, ${g}, ${b}, 0.9)`,
          textColor,
        });
      } catch (error) {
        console.error("Error extracting color:", error);
        resolve(null);
      }
    };

    img.onerror = () => {
      console.error("Failed to load image for color extraction");
      resolve(null);
    };

    img.src = imageUrl;
  });
}

/**
 * React hook to extract vibrant color from artwork URL
 *
 * @param artworkUrl - URL of the artwork image
 * @returns Extracted color or null
 *
 * @example
 * ```tsx
 * const color = useVibrantColor(artwork);
 * <NowPlaying vibrantColor={color?.rgba} />
 * ```
 */
export function useVibrantColor(artworkUrl: string): ExtractedColor | null {
  const [color, setColor] = React.useState<ExtractedColor | null>(null);

  React.useEffect(() => {
    extractVibrantColor(artworkUrl).then(setColor);
  }, [artworkUrl]);

  return color;
}

// React import for hook
import * as React from "react";
