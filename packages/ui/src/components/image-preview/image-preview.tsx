"use client";

import { m } from "framer-motion";
import { useEffect, useState } from "react";
import { Box } from "../box/box";

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
   * @default { x: 20, y: 20 }
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
  width = 300,
  height = 200,
  offset = { x: 20, y: 20 },
}: ImagePreviewProps) {
  const [previewImage, setPreviewImage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [cursorX, setCursorX] = useState(-1000);
  const [cursorY, setCursorY] = useState(-1000);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorX(e.clientX + offset.x);
      setCursorY(e.clientY + offset.y);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
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

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
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
    document.addEventListener("mouseenter", handleMouseEnter, true);
    document.addEventListener("mouseleave", handleMouseLeave, true);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter, true);
      document.removeEventListener("mouseleave", handleMouseLeave, true);
    };
  }, [offset.x, offset.y]);

  if (!isVisible || !previewImage) {
    return null;
  }

  return (
    <Box
      as={m.div}
      style={{
        x: cursorX,
        y: cursorY,
      }}
      css={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <Box
        as="img"
        src={previewImage}
        alt="Preview"
        css={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: "cover",
        }}
      />
    </Box>
  );
}

ImagePreview.displayName = "ImagePreview";
