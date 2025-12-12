"use client";

import { useCallback, useMemo, useRef } from "react";
import {
  Autoplay,
  EffectCards,
  EffectCoverflow,
  EffectCreative,
  EffectCube,
  EffectFade,
  EffectFlip,
  Navigation,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/effect-cube";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-flip";
import "swiper/css/effect-cards";
import "swiper/css/effect-creative";
import type { SystemStyleObject } from "styled-system/types";
import { AnimateInView, type AnimationType } from "../animate-in-view";
import { Box } from "../box/box";
import { CopyrightLabel, type CopyrightPosition } from "../copyright-label";
import { IconButton } from "../icon-button";
import { Image } from "../image/image";
import { HStack } from "../stack/stack";
import { video } from "../video/video";

// Swiper effect configurations
const SWIPER_FADE_EFFECT = {
  crossFade: true,
};

const SWIPER_CUBE_EFFECT = {
  shadow: true,
  slideShadows: true,
  shadowOffset: 20,
  shadowScale: 0.94,
};

const SWIPER_COVERFLOW_EFFECT = {
  rotate: 50,
  stretch: 0,
  depth: 100,
  modifier: 1,
  slideShadows: true,
};

const SWIPER_FLIP_EFFECT = {
  slideShadows: true,
  limitRotation: true,
};

const SWIPER_CARDS_EFFECT = {
  slideShadows: true,
};

const SWIPER_CREATIVE_EFFECT = {
  prev: {
    shadow: true,
    translate: ["-20%", 0, -1],
  },
  next: {
    translate: ["100%", 0, 0],
  },
};

// Sub-component: Video Slide
interface SlideshowVideoSlideProps {
  videoUrl: string;
  videoPoster?: string;
  aspectRatio: string;
}

function SlideshowVideoSlide({
  videoUrl,
  videoPoster,
  aspectRatio,
}: SlideshowVideoSlideProps) {
  const VideoComponent = video;
  return (
    <VideoComponent
      src={videoUrl}
      poster={videoPoster}
      aspectRatio={aspectRatio as "16/9" | "4/3" | "1/1" | "21/9" | "9/16"}
      autoPlay
      muted
      loop
      controls={false}
      css={{
        w: "full",
        h: "full",
      }}
    />
  );
}

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
   * Copyright notice
   */
  copyright?: string;
  /**
   * Copyright position
   * @default "vertical-right"
   */
  copyrightPosition?: CopyrightPosition;
  /**
   * Image focus point for cropping (e.g., "50x50", "25x75")
   */
  focus?: string;
  /**
   * Video URL (if this is a video slide instead of image)
   */
  videoUrl?: string;
  /**
   * Video poster image (shown before video loads)
   */
  videoPoster?: string;
}

export type SwiperEffect =
  | "slide"
  | "fade"
  | "cube"
  | "coverflow"
  | "flip"
  | "cards"
  | "creative";

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
   * Swiper transition effect
   * @default "slide"
   */
  effect?: SwiperEffect;
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
   * @default 300
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
export function Slideshow({
  images,
  animation = "none",
  animationDelay,
  effect = "slide",
  aspectRatio = "16/9",
  autoplayDelay = 7000,
  speed = 300,
  showNavigation = true,
  css: cssProp,
  ...props
}: SlideshowProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  const handlePrev = useCallback(() => {
    swiperRef.current?.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  // Effect modules lookup table
  const EFFECT_MODULES: Record<SwiperEffect, typeof EffectFade | undefined> = {
    slide: undefined,
    fade: EffectFade,
    cube: EffectCube,
    coverflow: EffectCoverflow,
    flip: EffectFlip,
    cards: EffectCards,
    creative: EffectCreative,
  };

  // Determine which modules to load based on effect
  const modules = useMemo(() => {
    const baseModules = [Navigation, Autoplay];
    const effectModule = EFFECT_MODULES[effect];
    return effectModule ? [...baseModules, effectModule] : baseModules;
  }, [effect]);

  return (
    <Box
      css={{ position: "relative", overflow: "visible", ...cssProp }}
      {...props}
    >
      <AnimateInView animation={animation} delay={animationDelay}>
        <Swiper
          modules={modules}
          effect={effect}
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
          fadeEffect={SWIPER_FADE_EFFECT}
          cubeEffect={SWIPER_CUBE_EFFECT}
          coverflowEffect={SWIPER_COVERFLOW_EFFECT}
          flipEffect={SWIPER_FLIP_EFFECT}
          cardsEffect={SWIPER_CARDS_EFFECT}
          creativeEffect={SWIPER_CREATIVE_EFFECT}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <Box
                css={{
                  position: "relative",
                  w: "full",
                  h: "full",
                }}
              >
                {image.videoUrl ? (
                  <>
                    <SlideshowVideoSlide
                      videoUrl={image.videoUrl}
                      videoPoster={image.videoPoster}
                      aspectRatio={aspectRatio}
                    />
                    {image.copyright && (
                      <CopyrightLabel
                        text={image.copyright}
                        position={image.copyrightPosition || "inline-black"}
                      />
                    )}
                  </>
                ) : (
                  <Image
                    src={image.url}
                    alt={image.alt}
                    aspectRatio={aspectRatio}
                    objectFit="cover"
                    copyright={image.copyright}
                    copyrightPosition={
                      image.copyrightPosition || "inline-white"
                    }
                  />
                )}
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </AnimateInView>

      {/* Navigation Arrows - Outside AnimateInView for absolute positioning */}
      {showNavigation && images.length > 1 && (
        <HStack
          gap="4px"
          css={{
            position: "absolute",
            top: "16px",
            right: "32px",
            zIndex: 20,
          }}
        >
          <IconButton
            icon="arrow-left"
            variant="default"
            onClick={handlePrev}
            aria-label="Previous slide"
            css={{
              color: "white",
              opacity: 0.35,
              transition: "opacity 0.2s",
              _hover: {
                opacity: 1,
              },
              md: {
                "& svg": {
                  width: "48px !important",
                  height: "48px !important",
                },
              },
              lg: {
                "& svg": {
                  width: "64px !important",
                  height: "64px !important",
                },
              },
            }}
            iconSize="32px"
          />
          <IconButton
            icon="arrow-right"
            variant="default"
            onClick={handleNext}
            aria-label="Next slide"
            css={{
              color: "white",
              opacity: 0.35,
              transition: "opacity 0.2s",
              _hover: {
                opacity: 1,
              },
              md: {
                "& svg": {
                  width: "48px !important",
                  height: "48px !important",
                },
              },
              lg: {
                "& svg": {
                  width: "64px !important",
                  height: "64px !important",
                },
              },
            }}
            iconSize="32px"
          />
        </HStack>
      )}
    </Box>
  );
}
