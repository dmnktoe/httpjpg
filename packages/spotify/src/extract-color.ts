"use client";

import { type Color, getColorSync } from "colorthief";

export interface ExtractedColor {
  /** Opaque CSS colour — `rgb(…)`, or `color(display-p3 …)` for wide-gamut artwork. */
  css: string;
  /** Readable foreground over that colour — `#ffffff` or `#000000`. */
  textColor: string;
  /** The same colour at `alpha`, emitted in the colour's own gamut. */
  withAlpha: (alpha: number) => string;
}

export async function extractVibrantColor(imageUrl: string): Promise<ExtractedColor | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      try {
        const color = getColorSync(img, { gamut: "auto" });
        if (!color) {
          resolve(null);
          return;
        }

        resolve({
          css: color.css(),
          textColor: color.textColor,
          withAlpha: (alpha) => cssWithAlpha(color, alpha),
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
 * `Color.css()` has no alpha channel, so build one in the colour's own gamut:
 * `color(display-p3 …)` takes 0–1 components, `rgba()` takes 0–255.
 */
function cssWithAlpha(color: Color, alpha: number): string {
  if (color.gamut === "display-p3") {
    const { r, g, b } = color.rgb("display-p3");
    return `color(display-p3 ${toP3Component(r)} ${toP3Component(g)} ${toP3Component(b)} / ${alpha})`;
  }

  const { r, g, b } = color.rgb();
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function toP3Component(channel: number): number {
  return Math.round((channel / 255) * 10000) / 10000;
}
