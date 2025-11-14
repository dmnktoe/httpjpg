"use client";

import { useCallback, useRef } from "react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";
import type { SystemStyleObject } from "styled-system/types";
import { AnimateInView, type AnimationType } from "../animate-in-view";
import { Box } from "../box/box";
import { Icon } from "../icon/icon";
import { Image } from "../image/image";

export interface SlideshowImage {
  /**
   * Image URL
   */
  url: string;
  /**
   * Alt text for accessibility
   */
  alt: string;
  /**
   * Copyright notice (displayed vertically on right side)
   */
  copyright?: string;
  /**
   * Image focus point for cropping (e.g., "50x50", "25x75")
   */
  focus?: string;
}

export interface SlideshowProps {
  /**
   * Array of images to display
   */
  images: SlideshowImage[];
  /**
   * Animation type for entrance
   * @default "none"
   */
  animation?: AnimationType;
  /**
   * Animation delay in seconds
   */
  animationDelay?: number;
  /**
   * Aspect ratio for images
   * @default "16/9"
   */
  aspectRatio?: string;
  /**
   * Autoplay delay in milliseconds
   * @default 7000
   */
  autoplayDelay?: number;
  /**
   * Transition speed in milliseconds
   * @default 0
   */
  speed?: number;
  /**
   * Show navigation arrows (only if more than 1 image)
   * @default true
   */
  showNavigation?: boolean;
  /**
   * Additional Panda CSS styles
   */
  css?: SystemStyleObject;
}

/**
 * Slideshow component - Image carousel with Swiper
 *
 * Displays a slideshow of images with autoplay, navigation arrows,
 * and smooth transitions. Supports copyright notices and animations.
 *
 * @example
 * ```tsx
 * <Slideshow
 *   images={[
 *     { url: "/image1.jpg", alt: "First image" },
 *     { url: "/image2.jpg", alt: "Second image", copyright: "John Doe" }
 *   ]}
 *   animation="sharpen"
 *   aspectRatio="16/9"
 * />
 * ```
 */
export const Slideshow = ({
  images,
  animation = "none",
  animationDelay,
  aspectRatio = "16/9",
  autoplayDelay = 7000,
  speed = 0,
  showNavigation = true,
  css: cssProp,
  ...props
}: SlideshowProps) => {
  const swiperRef = useRef<SwiperType | null>(null);

  const handlePrev = useCallback(() => {
    swiperRef.current?.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  return (
    <Box
      css={{ position: "relative", overflow: "visible", ...cssProp }}
      {...props}
    >
      <AnimateInView animation={animation} delay={animationDelay}>
        <Swiper
          modules={[Navigation, Autoplay]}
          speed={speed}
          spaceBetween={15}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          autoplay={{
            delay: autoplayDelay,
            disableOnInteraction: false,
          }}
          loop={images.length > 1}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <Box
                css={{
                  position: "relative",
                  w: "full",
                  h: "full",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  aspectRatio={aspectRatio}
                  objectFit="cover"
                />
                {image.copyright && (
                  <Box
                    css={{
                      position: "absolute",
                      right: "-40px",
                      bottom: "48px",
                      transform: "rotate(-90deg)",
                      transformOrigin: "right center",
                      fontSize: "xs",
                      color: "black",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      pointerEvents: "none",
                    }}
                  >
                    © {image.copyright}
                  </Box>
                )}
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </AnimateInView>

      {/* Navigation Arrows - Outside AnimateInView for absolute positioning */}
      {showNavigation && images.length > 1 && (
        <Box
          css={{
            position: "absolute",
            top: "16px",
            right: "32px",
            zIndex: 20,
            display: "flex",
            gap: "12px",
          }}
        >
          <Box
            as="button"
            onClick={handlePrev}
            css={{
              cursor: "pointer",
              bg: "transparent",
              border: "none",
              p: 0,
              color: "white",
              transition: "color 0.2s",
              _hover: {
                color: "white",
              },
              "@media (min-width: 1280px)": {
                color: "rgba(255, 255, 255, 0.35)",
              },
            }}
          >
            <Icon name="arrow-left" size="64px" />
          </Box>
          <Box
            as="button"
            onClick={handleNext}
            css={{
              cursor: "pointer",
              bg: "transparent",
              border: "none",
              p: 0,
              color: "white",
              transition: "color 0.2s",
              _hover: {
                color: "white",
              },
              "@media (min-width: 1280px)": {
                color: "rgba(255, 255, 255, 0.35)",
              },
            }}
          >
            <Icon name="arrow-right" size="64px" />
          </Box>
        </Box>
      )}
    </Box>
  );
};
