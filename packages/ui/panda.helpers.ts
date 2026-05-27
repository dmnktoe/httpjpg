// Build-time only — not exported from the runtime package.

export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "");
  const r = Number.parseInt(cleanHex.slice(0, 2), 16);
  const g = Number.parseInt(cleanHex.slice(2, 4), 16);
  const b = Number.parseInt(cleanHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
