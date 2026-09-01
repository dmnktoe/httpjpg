"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/effect-cube";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-flip";
import "swiper/css/effect-cards";
import "swiper/css/effect-creative";
import type { Swiper as SwiperType } from "swiper/types";

import { Box } from "../box/box";
import type { OverlayPattern } from "../image-overlay/image-overlay";
import {
  EFFECT_MODULES,
  SWIPER_CARDS_EFFECT,
  SWIPER_COVERFLOW_EFFECT,
  SWIPER_CREATIVE_EFFECT,
  SWIPER_CUBE_EFFECT,
  SWIPER_FADE_EFFECT,
  SWIPER_FLIP_EFFECT,
  type SlideshowImage,
  type SwiperEffect,
} from "./lib";
import { SlideshowCounter } from "./slideshow-counter";
import { SlideshowNav } from "./slideshow-nav";
import { SlideshowSlide } from "./slideshow-slide";

export type { SlideshowImage, SwiperEffect };
export { VIDEO_START_TIMEOUT_MS } from "./slideshow-video-slide";

export interface SlideshowProps {
  images: SlideshowImage[];
  effect?: SwiperEffect;
  aspectRatio?: string;
  autoplayDelay?: number;
  speed?: number;
  showNavigation?: boolean;
  disableBlurOnLoad?: boolean;
  sizes?: string;
  priority?: boolean;
  overlay?: OverlayPattern;
  overlayInset?: number;
  showCounter?: boolean;
  waitForVideo?: boolean;
  css?: SystemStyleObject;
}

export function Slideshow({
  images,
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
  waitForVideo = true,
  css: cssProp,
  ...props
}: SlideshowProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const blurUp = !disableBlurOnLoad && !prefersReducedMotion;
  const autoplayEnabled = images.length > 1 && !prefersReducedMotion;
  const holdForVideo = waitForVideo && autoplayEnabled;
  const isVideoSlideActive = Boolean(images[activeIndex]?.videoUrl);

  const handlePrev = useCallback(() => {
    swiperRef.current?.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex ?? 0);
  }, []);

  const handleVideoDone = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  const syncAutoplay = useCallback(
    (swiper: SwiperType | null, isVideoSlide: boolean) => {
      const autoplay = swiper?.autoplay;
      if (!autoplay || !holdForVideo) {
        return;
      }
      if (isVideoSlide) {
        autoplay.stop();
      } else if (!autoplay.running) {
        autoplay.start();
      }
    },
    [holdForVideo],
  );

  const handleSwiperInit = useCallback(
    (swiper: SwiperType) => {
      swiperRef.current = swiper;
      syncAutoplay(swiper, Boolean(images[swiper.realIndex ?? 0]?.videoUrl));
    },
    [images, syncAutoplay],
  );

  useEffect(() => {
    syncAutoplay(swiperRef.current, isVideoSlideActive);
  }, [isVideoSlideActive, syncAutoplay]);

  const modules = useMemo(() => {
    const effectModule = EFFECT_MODULES[effect];
    return [...(autoplayEnabled ? [Autoplay] : []), ...(effectModule ? [effectModule] : [])];
  }, [autoplayEnabled, effect]);

  return (
    <Box css={{ position: "relative", overflow: "visible", ...cssProp }} {...props}>
      <Swiper
        modules={modules}
        effect={effect}
        speed={speed}
        spaceBetween={15}
        onSwiper={handleSwiperInit}
        onSlideChange={handleSlideChange}
        loop={images.length > 1}
        autoplay={
          autoplayEnabled
            ? { delay: autoplayDelay, disableOnInteraction: false, waitForTransition: false }
            : false
        }
        fadeEffect={SWIPER_FADE_EFFECT}
        cubeEffect={SWIPER_CUBE_EFFECT}
        coverflowEffect={SWIPER_COVERFLOW_EFFECT}
        flipEffect={SWIPER_FLIP_EFFECT}
        cardsEffect={SWIPER_CARDS_EFFECT}
        creativeEffect={SWIPER_CREATIVE_EFFECT}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index} suppressHydrationWarning>
            <SlideshowSlide
              image={image}
              index={index}
              aspectRatio={aspectRatio}
              isActive={activeIndex === index}
              blurOnLoad={blurUp}
              loading={prefersReducedMotion || (priority && index === 0) ? "eager" : "lazy"}
              fetchPriority={priority && index === 0 ? "high" : "auto"}
              sizes={sizes}
              overlay={overlay}
              overlayInset={overlayInset}
              holdUntilEnded={holdForVideo && Boolean(image.videoUrl)}
              onVideoDone={handleVideoDone}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {showCounter && images.length > 1 && (
        <SlideshowCounter activeIndex={activeIndex} total={images.length} />
      )}

      {showNavigation && images.length > 1 && (
        <SlideshowNav onPrev={handlePrev} onNext={handleNext} />
      )}
    </Box>
  );
}
