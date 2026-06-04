"use client";

import { zIndex } from "@httpjpg/tokens";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface ImagePreviewProps {
  width?: number;
  height?: number;
  offset?: { x: number; y: number };
}

const DEFAULT_RATIO = 16 / 9;

// Parses a "w:h" ratio attribute (e.g. "2:3") into a numeric aspect ratio.
function parseRatio(value: string | null): number {
  if (!value) {
    return DEFAULT_RATIO;
  }
  const [w, h] = value.split(":").map(Number);
  if (!w || !h) {
    return DEFAULT_RATIO;
  }
  return w / h;
}

export function ImagePreview({
  width = 100,
  offset = { x: 5, y: 5 },
}: Omit<ImagePreviewProps, "height">) {
  const [previewImage, setPreviewImage] = useState("");
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  const [previewWidth, setPreviewWidth] = useState(width);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsVisible(false);
    setPreviewImage("");
  }, [pathname]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        containerRef.current.style.transform = `translate(${e.clientX + offset.x}px, ${e.clientY + offset.y}px)`;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) {
        return;
      }

      const imageElement =
        target.closest("[data-preview-image]") ||
        (target.hasAttribute("data-preview-image") ? target : null);

      if (imageElement) {
        const imageUrl = imageElement.getAttribute("data-preview-image") || "";
        if (imageUrl) {
          const widthOverride = Number(imageElement.getAttribute("data-preview-width"));
          setPreviewImage(imageUrl);
          setRatio(parseRatio(imageElement.getAttribute("data-preview-ratio")));
          setPreviewWidth(widthOverride > 0 ? widthOverride : width);
          setIsVisible(true);
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) {
        return;
      }

      const imageElement =
        target.closest("[data-preview-image]") ||
        (target.hasAttribute("data-preview-image") ? target : null);

      if (imageElement) {
        setIsVisible(false);
        setPreviewImage("");
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver, true);
    document.addEventListener("mouseout", handleMouseOut, true);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver, true);
      document.removeEventListener("mouseout", handleMouseOut, true);
    };
  }, [offset.x, offset.y]);

  const height = Math.round(previewWidth / ratio);

  if (!isVisible || !previewImage) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${previewWidth}px`,
        height: `${height}px`,
        transform: "translate(-1000px, -1000px)",
        pointerEvents: "none",
        zIndex: zIndex.previewImage,
      }}
    >
      <img
        src={previewImage}
        alt="Preview"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}

ImagePreview.displayName = "ImagePreview";
