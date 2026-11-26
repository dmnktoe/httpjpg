export interface CropInput {
  width: number;
  height: number;
  ratio: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

export function cropRect(input: CropInput): CropRect {
  const zoom = clamp(input.zoom, MIN_ZOOM, MAX_ZOOM);
  const fitsWidth = input.width / input.height <= input.ratio;
  const width = (fitsWidth ? input.width : input.height * input.ratio) / zoom;
  const height = (fitsWidth ? input.width / input.ratio : input.height) / zoom;
  const roomX = input.width - width;
  const roomY = input.height - height;
  return {
    x: (roomX * (1 + clamp(input.offsetX, -1, 1))) / 2,
    y: (roomY * (1 + clamp(input.offsetY, -1, 1))) / 2,
    width,
    height,
  };
}

export function isCropped(input: Pick<CropInput, "zoom" | "offsetX" | "offsetY">): boolean {
  return input.zoom > MIN_ZOOM || input.offsetX !== 0 || input.offsetY !== 0;
}

export function panCrop(
  input: CropInput,
  dx: number,
  dy: number,
): Pick<CropInput, "offsetX" | "offsetY"> {
  const rect = cropRect(input);
  const roomX = input.width - rect.width;
  const roomY = input.height - rect.height;
  return {
    offsetX: roomX > 0 ? clamp(input.offsetX - (dx * rect.width * 2) / roomX, -1, 1) : 0,
    offsetY: roomY > 0 ? clamp(input.offsetY - (dy * rect.height * 2) / roomY, -1, 1) : 0,
  };
}

export function cropPreviewStyle(
  input: CropInput,
): Record<"left" | "top" | "width" | "height", string> {
  const rect = cropRect(input);
  return {
    left: percent(-rect.x / rect.width),
    top: percent(-rect.y / rect.height),
    width: percent(input.width / rect.width),
    height: percent(input.height / rect.height),
  };
}

export function formatRatio(format: string, first?: { width?: number; height?: number }): number {
  if (format === "4/5") {
    return 4 / 5;
  }
  if (format === "original" && first?.width && first.height) {
    return first.width / first.height;
  }
  return 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);
}

function percent(fraction: number): string {
  return `${Math.round(fraction * 1e6) / 1e4}%`;
}
