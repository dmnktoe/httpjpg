"use client";

import type { ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

export interface ScaledContainerProps {
  /**
   * Content to be scaled
   */
  children: ReactNode;
  /**
   * Design width in pixels
   * @default 1920
   */
  designWidth?: number;
  /**
   * Design height in pixels
   * @default 1080
   */
  designHeight?: number;
  /**
   * Minimum scale factor
   * @default 0.3
   */
  minScale?: number;
  /**
   * Maximum scale factor
   * @default 2
   */
  maxScale?: number;
  /**
   * Scale mode: 'fit' scales to fit viewport, 'width' scales based on width only
   * @default "fit"
   */
  scaleMode?: "fit" | "width";
  /**
   * Additional Panda CSS styles for outer container
   */
  css?: SystemStyleObject;
  /**
   * Additional Panda CSS styles for inner scaled content
   */
  innerCss?: SystemStyleObject;
}

/**
 * ScaledContainer component - Proportional scaling like Readymag/Photoshop
 *
 * Creates a fixed-size canvas that scales proportionally based on viewport size.
 * Perfect for portfolio layouts where everything should scale together without layout shifts.
 * All child elements should use absolute positioning within the design dimensions.
 *
 * @example
 * ```tsx
 * <ScaledContainer designWidth={1920} designHeight={1080}>
 *   <Box style={{ position: 'absolute', top: 100, left: 200 }}>
 *     <Headline>Scaled Content</Headline>
 *   </Box>
 * </ScaledContainer>
 * ```
 */
export const ScaledContainer = forwardRef<HTMLDivElement, ScaledContainerProps>(
  (
    {
      children,
      designWidth = 1920,
      designHeight = 1080,
      minScale = 0.3,
      maxScale = 2,
      scaleMode = "fit",
      css: cssProp,
      innerCss,
      ...props
    },
    ref,
  ) => {
    const [scale, setScale] = useState(1);
    const [viewportSize, setViewportSize] = useState({
      width: 1920,
      height: 1080,
    });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const calculateScale = () => {
        if (typeof window === "undefined") {
          return;
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        setViewportSize({ width: viewportWidth, height: viewportHeight });

        let newScale: number;

        if (scaleMode === "width") {
          // Scale based on width only
          newScale = viewportWidth / designWidth;
        } else {
          // Scale to fit both dimensions (maintains aspect ratio)
          const scaleX = viewportWidth / designWidth;
          const scaleY = viewportHeight / designHeight;
          newScale = Math.min(scaleX, scaleY);
        }

        // Clamp scale between min and max
        newScale = Math.max(minScale, Math.min(maxScale, newScale));

        setScale(newScale);
      };

      // Calculate initial scale
      calculateScale();

      // Recalculate on window resize
      window.addEventListener("resize", calculateScale);
      return () => window.removeEventListener("resize", calculateScale);
    }, [designWidth, designHeight, minScale, maxScale, scaleMode]);

    // Calculate scaled dimensions for centering
    const scaledWidth = designWidth * scale;
    const scaledHeight = designHeight * scale;
    const offsetX = (viewportSize.width - scaledWidth) / 2;
    const offsetY = (viewportSize.height - scaledHeight) / 2;

    return (
      <Box
        ref={ref}
        css={{
          w: "full",
          minH: "100vh",
          overflow: "hidden",
          bg: "neutral.50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...cssProp,
        }}
        {...props}
      >
        <Box
          ref={containerRef}
          css={{
            position: "relative",
            transformOrigin: "top left",
            ...innerCss,
          }}
          style={{
            width: `${designWidth}px`,
            height: `${designHeight}px`,
            transform: `scale(${scale})`,
            marginLeft: `${offsetX}px`,
            marginTop: `${offsetY}px`,
          }}
        >
          {children}
        </Box>
      </Box>
    );
  },
);

ScaledContainer.displayName = "ScaledContainer";
