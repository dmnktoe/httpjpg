import sharp from "sharp";

const ASCII_RAMP = " .:-=+*#%@";

export interface AsciiResult {
  text: string;
  cols: number;
  rows: number;
}

export function pixelsToAsciiGrid(pixels: ArrayLike<number>, cols: number, rows: number): string {
  const rampLen = ASCII_RAMP.length;
  const lines: string[] = [];
  for (let y = 0; y < rows; y++) {
    let line = "";
    for (let x = 0; x < cols; x++) {
      const v = (pixels[y * cols + x] ?? 0) / 255;
      const idx = Math.min(rampLen - 1, Math.floor(v * rampLen));
      line += ASCII_RAMP[idx];
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export async function imageToAscii(url: string, cols = 110, rows = 38): Promise<AsciiResult> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`og-ascii: source image fetch failed (${res.status})`);
  }
  const input = Buffer.from(await res.arrayBuffer());
  const { data, info } = await sharp(input)
    .resize(cols, rows, { fit: "fill" })
    .grayscale()
    .normalise()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    text: pixelsToAsciiGrid(data, info.width, info.height),
    cols: info.width,
    rows: info.height,
  };
}
