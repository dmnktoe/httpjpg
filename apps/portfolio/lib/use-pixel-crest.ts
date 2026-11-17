"use client";

import { useEffect, useState } from "react";

export function usePixelCrest(src: string | null): string | null {
  const isRemote = Boolean(src && !src.startsWith("data:"));
  const [pixelated, setPixelated] = useState<{ src: string; uri: string | null } | null>(null);

  useEffect(() => {
    if (!src || !isRemote) {
      return;
    }
    let isCancelled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (!isCancelled) {
        setPixelated({ src, uri: pixelate(image) });
      }
    };
    image.onerror = () => {
      if (!isCancelled) {
        setPixelated({ src, uri: null });
      }
    };
    image.src = src;
    return () => {
      isCancelled = true;
    };
  }, [src, isRemote]);

  if (!isRemote) {
    return src;
  }
  return pixelated?.src === src ? pixelated.uri : null;
}

export function pixelate(image: HTMLImageElement): string | null {
  const { naturalWidth: width, naturalHeight: height } = image;
  if (!width || !height) {
    return null;
  }
  const canvas = document.createElement("canvas");
  canvas.width = CREST_SIZE;
  canvas.height = CREST_SIZE;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }
  const scale = Math.min(CREST_SIZE / width, CREST_SIZE / height);
  const drawWidth = Math.round(width * scale);
  const drawHeight = Math.round(height * scale);
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    Math.floor((CREST_SIZE - drawWidth) / 2),
    Math.floor((CREST_SIZE - drawHeight) / 2),
    drawWidth,
    drawHeight,
  );
  try {
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

const CREST_SIZE = 16;
