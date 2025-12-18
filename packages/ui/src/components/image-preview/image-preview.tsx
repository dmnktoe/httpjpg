"use client";

import { useEffect, useRef, useState } from "react";

export interface ImagePreviewProps {
  /**
   * Preview image width in pixels
   * @default 300
   */
  width?: number;
  /**
   * Preview image height in pixels
   * @default 200
   */
  height?: number;
  /**
   * Offset from cursor in pixels
   * @default { x: 5, y: 5 }
   */
  offset?: { x: number; y: number };
}

/**
 * Image Preview - Shows preview images on hover
 *
 * Displays images when hovering over elements with data-preview-image attribute.
 * Independent from cursor styling - purely for image previews.
 *
 * @example
 * ```tsx
 * // Add to root layout
 * <ImagePreview />
 *
 * // Add to links/elements
 * <a href="/work" data-preview-image="/work/image.jpg">Work Title</a>
 * ```
 */
export function ImagePreview({
  width = 100,
  offset = { x: 5, y: 5 },
}: Omit<ImagePreviewProps, "height">) {
  const [previewImage, setPreviewImage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
          setPreviewImage(imageUrl);
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

    // Add listeners to document
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver, true);
    document.addEventListener("mouseout", handleMouseOut, true);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver, true);
      document.removeEventListener("mouseout", handleMouseOut, true);
    };
  }, [offset.x, offset.y]);

  const height = Math.round((width * 9) / 16); // 16:9 ratio

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
        width: `${width}px`,
        height: `${height}px`,
        transform: "translate(-1000px, -1000px)",
        pointerEvents: "none",
        zIndex: "preview",
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
