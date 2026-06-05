"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";
import type { SystemStyleObject } from "styled-system/types";
import {
  Autoplay,
  EffectCards,
  EffectCoverflow,
  EffectCreative,
  EffectCube,
  EffectFade,
  EffectFlip,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/effect-cube";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-flip";
import "swiper/css/effect-cards";
import "swiper/css/effect-creative";
import type { Swiper as SwiperType } from "swiper/types";

import { AnimateInView, type AnimationType } from "../animate-in-view/animate-in-view";
import { ASCII_TAPE } from "../ascii-art/banners";
import { Box } from "../box/box";
import { CopyrightLabel, type CopyrightPosition } from "../copyright-label/copyright-label";
import { IconButton } from "../icon-button/icon-button";
import { ImageOverlay, type OverlayPattern } from "../image-overlay/image-overlay";
import { Image } from "../image/image";
import { HStack } from "../stack/stack";
import { Video } from "../video/video";

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

interface SlideshowVideoSlideProps {
  videoUrl: string;
  videoPoster?: string;
  aspectRatio: string;
}

function SlideshowVideoSlide({ videoUrl, videoPoster, aspectRatio }: SlideshowVideoSlideProps) {
  return (
    <Video
      src={videoUrl}
      poster={videoPoster}
      aspectRatio={aspectRatio}
      objectFit="cover"
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
  url: string;
  alt: string;
  copyright?: string;
  copyrightPosition?: CopyrightPosition;
  focus?: string;
  videoUrl?: string;
  videoPoster?: string;
  srcSet?: string;
}

export type SwiperEffect = "slide" | "fade" | "cube" | "coverflow" | "flip" | "cards" | "creative";

const EFFECT_MODULES: Record<SwiperEffect, typeof EffectFade | undefined> = {
  slide: undefined,
  fade: EffectFade,
  cube: EffectCube,
  coverflow: EffectCoverflow,
  flip: EffectFlip,
  cards: EffectCards,
  creative: EffectCreative,
};

export interface SlideshowProps {
  images: SlideshowImage[];
  animation?: AnimationType;
  animationDelay?: number;
  effect?: SwiperEffect;
  aspectRatio?: string;
  autoplayDelay?: number;
  speed?: number;
  showNavigation?: boolean;
  disableBlurOnLoad?: boolean;
  sizes?: string;
  /** Marks the first slide as the LCP image: eager + `fetchpriority="high"`. */
  priority?: boolean;
  /**
   * Layer an `<ImageOverlay>` on every slide. `"random"` picks a different
   * pattern per slide using the image url as a seed.
   */
  overlay?: OverlayPattern;
  /**
   * Push overlay particles inward by this percentage so they sit on the
   * slide image instead of around it. @default 0
   */
  overlayInset?: number;
  /** Show a `01/04` counter + decorative tape strip in the corner. */
  showCounter?: boolean;
  css?: SystemStyleObject;
}

export function Slideshow({
  images,
  animation = "none",
  animationDelay,
  effect = "slide",
  aspectRatio = "16/9",
  autoplayDelay = 7000,
  speed = 300,
  showNavigation = true,
  disableBlurOnLoad = false,
  sizes,
  priority = false,
  overlay = "none",
  overlayInset = 0,
  showCounter = false,
  css: cssProp,
  ...props
}: SlideshowProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const handlePrev = useCallback(() => {
    swiperRef.current?.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  const handleSwiperInit = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex ?? 0);
  }, []);

  const autoplayEnabled = images.length > 1 && !prefersReducedMotion;

  const modules = useMemo(() => {
    const effectModule = EFFECT_MODULES[effect];
    return [...(autoplayEnabled ? [Autoplay] : []), ...(effectModule ? [effectModule] : [])];
  }, [autoplayEnabled, effect]);

  return (
    <Box css={{ position: "relative", overflow: "visible", ...cssProp }} {...props}>
      <AnimateInView animation={animation} delay={animationDelay}>
        <Swiper
          modules={modules}
          effect={effect}
          speed={speed}
          spaceBetween={15}
          onSwiper={handleSwiperInit}
          onSlideChange={handleSlideChange}
          loop={images.length > 1}
          autoplay={autoplayEnabled ? { delay: autoplayDelay, disableOnInteraction: false } : false}
          fadeEffect={SWIPER_FADE_EFFECT}
          cubeEffect={SWIPER_CUBE_EFFECT}
          coverflowEffect={SWIPER_COVERFLOW_EFFECT}
          flipEffect={SWIPER_FLIP_EFFECT}
          cardsEffect={SWIPER_CARDS_EFFECT}
          creativeEffect={SWIPER_CREATIVE_EFFECT}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index} suppressHydrationWarning>
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
                    srcSet={image.srcSet}
                    sizes={sizes}
                    alt={image.alt}
                    aspectRatio={aspectRatio}
                    objectFit="cover"
                    copyright={image.copyright}
                    copyrightPosition={image.copyrightPosition || "inline-white"}
                    blurOnLoad={!disableBlurOnLoad}
                    loading={priority && index === 0 ? "eager" : "lazy"}
                    fetchPriority={priority && index === 0 ? "high" : "auto"}
                  />
                )}
                {overlay !== "none" && !image.videoUrl && (
                  <ImageOverlay
                    pattern={overlay}
                    seed={image.url || image.alt || `slide-${index}`}
                    color="white"
                    opacity={0.85}
                    inset={overlayInset}
                  />
                )}
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </AnimateInView>

      {showCounter && images.length > 1 && (
        <Box
          css={{
            position: "absolute",
            bottom: "3",
            left: "3",
            zIndex: "docked",
            display: "flex",
            flexDirection: "column",
            gap: "0.5",
            color: "white",
            fontFamily: "mono",
            fontSize: "xs",
            letterSpacing: "0.15em",
            pointerEvents: "none",
            userSelect: "none",
            textShadow: "0 0 6px rgba(0,0,0,0.6)",
          }}
          aria-hidden="true"
        >
          <Box as="span">
            {String(activeIndex + 1).padStart(2, "0")}
            <Box as="span" css={{ mx: "1", opacity: 0.5 }}>
              /
            </Box>
            <Box as="span" css={{ opacity: 0.7 }}>
              {String(images.length).padStart(2, "0")}
            </Box>
          </Box>
          <Box as="span" css={{ opacity: 0.5, fontSize: "2xs" }}>
            {ASCII_TAPE}
          </Box>
        </Box>
      )}

      {showNavigation && images.length > 1 && (
        <HStack
          gap="1"
          css={{
            position: "absolute",
            top: "4",
            right: "8",
            zIndex: "docked",
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
