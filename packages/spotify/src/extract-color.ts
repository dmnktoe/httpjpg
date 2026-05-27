"use client";

import { getColorSync } from "colorthief";

export interface ExtractedColor {
  rgb: string;
  rgba: string;
  textColor: "black" | "white";
}

export async function extractVibrantColor(imageUrl: string): Promise<ExtractedColor | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      try {
        const color = getColorSync(img);
        if (!color) {
          resolve(null);
          return;
        }

        const { r, g, b } = color.rgb();

        resolve({
          rgb: `rgb(${r}, ${g}, ${b})`,
          rgba: `rgba(${r}, ${g}, ${b}, 0.9)`,
          textColor: color.isDark ? "white" : "black",
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
