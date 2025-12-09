/**
 * Color utility functions for UI components
 * Provides helpers for color conversion and manipulation
 */

/**
 * Convert hex color to rgba string
 * @param hex - Hex color string (e.g., "#3B82F6")
 * @param alpha - Alpha value between 0 and 1
 * @returns RGBA string (e.g., "rgba(59, 130, 246, 0.9)")
 *
 * @example
 * hexToRgba("#3B82F6", 0.9) // "rgba(59, 130, 246, 0.9)"
 * hexToRgba(colors.primary[500], 0.5) // "rgba(59, 130, 246, 0.5)"
 */
export function hexToRgba(hex: string, alpha: number): string {
  // Remove # if present
  const cleanHex = hex.replace("#", "");

  // Parse RGB values
  const r = Number.parseInt(cleanHex.slice(0, 2), 16);
  const g = Number.parseInt(cleanHex.slice(2, 4), 16);
  const b = Number.parseInt(cleanHex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Create a linear gradient with rgba colors
 * @param direction - Gradient direction (e.g., "135deg", "90deg")
 * @param stops - Array of color stops with hex and alpha values
 * @returns CSS linear-gradient string
 *
 * @example
 * linearGradient("135deg", [
 *   { hex: "#FF8C6B", alpha: 0.9, position: "0%" },
 *   { hex: "#F5576C", alpha: 0.9, position: "100%" }
 * ])
 * // "linear-gradient(135deg, rgba(255, 140, 107, 0.9) 0%, rgba(245, 87, 108, 0.9) 100%)"
 */
export function linearGradient(
  direction: string,
  stops: Array<{ hex: string; alpha: number; position?: string }>,
): string {
  const colorStops = stops
    .map((stop) => {
      const rgba = hexToRgba(stop.hex, stop.alpha);
      return stop.position ? `${rgba} ${stop.position}` : rgba;
    })
    .join(", ");

  return `linear-gradient(${direction}, ${colorStops})`;
}
