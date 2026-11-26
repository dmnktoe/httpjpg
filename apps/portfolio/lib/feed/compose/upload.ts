import { signUpload } from "./api";
import type { CropRect } from "./crop";

export interface PreparedFile {
  blob: Blob;
  filename: string;
  width?: number;
  height?: number;
}

const MAX_SIDE = 4096;
const JPEG_QUALITY = 0.92;

/**
 * Draws the picture again, cropped to `rect` when there is one. A file that went
 * through the canvas carries no camera or location data. GIFs and videos cannot
 * take that path and go up as they are.
 */
export async function prepareImage(
  file: File,
  name: string,
  rect?: CropRect,
): Promise<PreparedFile> {
  if (file.type === "image/gif") {
    return { blob: file, filename: `${name}.gif` };
  }
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const source = rect ?? { x: 0, y: 0, width: bitmap.width, height: bitmap.height };
  const scale = Math.min(1, MAX_SIDE / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas
    .getContext("2d")
    ?.drawImage(bitmap, source.x, source.y, source.width, source.height, 0, 0, width, height);
  bitmap.close();
  const isPng = file.type === "image/png";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, isPng ? "image/png" : "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) {
    throw new Error("The browser could not encode the picture");
  }
  return { blob, filename: `${name}.${isPng ? "png" : "jpg"}`, width, height };
}

export function prepareFile(file: File, name: string): PreparedFile {
  const extension = /\.([a-z0-9]+)$/i.exec(file.name)?.[1]?.toLowerCase() ?? "bin";
  return { blob: file, filename: `${name}.${extension}` };
}

/**
 * Signs the upload with the site, then posts the file to Storyblok's storage itself.
 * The storage answers without CORS headers, so the response cannot be read: the site
 * checks the upload when it finishes it.
 */
export async function uploadFile(prepared: PreparedFile): Promise<number> {
  const signed = await signUpload({
    filename: prepared.filename,
    ...(prepared.width && prepared.height
      ? { width: prepared.width, height: prepared.height }
      : {}),
  });
  const form = new FormData();
  for (const [key, value] of Object.entries(signed.fields)) {
    form.append(key, value);
  }
  form.append("file", prepared.blob, prepared.filename);
  await fetch(signed.uploadUrl, { method: "POST", body: form, mode: "no-cors" });
  return signed.id;
}
