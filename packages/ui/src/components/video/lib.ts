export function getYouTubeId(url: string): string {
  if (url.length === 11 && !url.includes("/") && !url.includes("?")) {
    return url;
  }
  const match = url.match(
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/,
  );
  return match && match[7].length === 11 ? match[7] : url;
}

export function getVimeoId(url: string): string {
  if (/^\d+$/.test(url)) {
    return url;
  }
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : url;
}

export function resolveAspectRatio(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function toDimension(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return undefined;
}

export function resolveMediaAspectRatio(width?: number, height?: number): string | undefined {
  if (!width || !height) {
    return undefined;
  }
  return `${width}/${height}`;
}
