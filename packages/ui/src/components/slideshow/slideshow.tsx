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

import { AnimateInView, type AnimationType } from "../animate-in-view/animate-in-view";
import { Box } from "../box/box";
import { CopyrightLabel, type CopyrightPosition } from "../copyright-label/copyright-label";
import { ImageOverlay, type OverlayPattern } from "../image-overlay/image-overlay";
import { Image } from "../image/image";
import {
  EFFECT_MODULES,
  isNearActive,
  SWIPER_CARDS_EFFECT,
  SWIPER_COVERFLOW_EFFECT,
  SWIPER_CREATIVE_EFFECT,
  SWIPER_CUBE_EFFECT,
  SWIPER_FADE_EFFECT,
  SWIPER_FLIP_EFFECT,
  type SwiperEffect,
} from "./lib";
import { SlideshowCounter } from "./slideshow-counter";
import { SlideshowNav } from "./slideshow-nav";
import { SlideshowVideoSlide } from "./slideshow-video-slide";

export type { SwiperEffect } from "./lib";
export { VIDEO_START_TIMEOUT_MS } from "./slideshow-video-slide";

export interface SlideshowImage {
  url: string;
  alt: string;
  copyright?: string;
  copyrightSource?: string;
  copyrightPosition?: CopyrightPosition;
  focus?: string;
  videoUrl?: string;
  videoPoster?: string;
  srcSet?: string;
}

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
  priority?: boolean;
  overlay?: OverlayPattern;
  overlayInset?: number;
  showCounter?: boolean;
  waitForVideo?: boolean;
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
  waitForVideo = true,
  css: cssProp,
  ...props
}: SlideshowProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [unplayableVideos, setUnplayableVideos] = useState<ReadonlySet<string>>(() => new Set());
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsNearViewport(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const handlePrev = useCallback(() => {
    swiperRef.current?.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex ?? 0);
  }, []);

  const autoplayEnabled = images.length > 1 && !prefersReducedMotion;
  const holdForVideo = waitForVideo && autoplayEnabled;
  const activeVideoUrl = images[activeIndex]?.videoUrl;
  const isVideoSlideActive = Boolean(activeVideoUrl) && !unplayableVideos.has(activeVideoUrl ?? "");

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

  const handleVideoFinished = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  const handleVideoUnplayable = useCallback((videoUrl: string) => {
    setUnplayableVideos((current) => {
      if (current.has(videoUrl)) {
        return current;
      }
      const next = new Set(current);
      next.add(videoUrl);
      return next;
    });
  }, []);

  const hasPlayableSlide = images.some(
    (image) => !image.videoUrl || !unplayableVideos.has(image.videoUrl),
  );
  useEffect(() => {
    if (!hasPlayableSlide || !activeVideoUrl || !unplayableVideos.has(activeVideoUrl)) {
      return;
    }
    swiperRef.current?.slideNext();
  }, [activeVideoUrl, hasPlayableSlide, unplayableVideos]);

  const modules = useMemo(() => {
    const effectModule = EFFECT_MODULES[effect];
    return [...(autoplayEnabled ? [Autoplay] : []), ...(effectModule ? [effectModule] : [])];
  }, [autoplayEnabled, effect]);

  return (
    <Box ref={rootRef} css={{ position: "relative", overflow: "visible", ...cssProp }} {...props}>
      <AnimateInView animation={animation} delay={animationDelay}>
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
                      holdUntilEnded={holdForVideo && !unplayableVideos.has(image.videoUrl)}
                      isActive={activeIndex === index}
                      onFinished={handleVideoFinished}
                      onUnplayable={handleVideoUnplayable}
                    />
                    {(image.copyright || image.copyrightSource) && (
                      <CopyrightLabel
                        text={image.copyright}
                        source={image.copyrightSource}
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
                    copyrightSource={image.copyrightSource}
                    copyrightPosition={image.copyrightPosition || "inline-white"}
                    blurOnLoad={!disableBlurOnLoad}
                    loading={
                      (priority && index === 0) ||
                      (isNearViewport && isNearActive(index, activeIndex, images.length))
                        ? "eager"
                        : "lazy"
                    }
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
        <SlideshowCounter activeIndex={activeIndex} total={images.length} />
      )}

      {showNavigation && images.length > 1 && (
        <SlideshowNav onPrev={handlePrev} onNext={handleNext} />
      )}
    </Box>
  );
}
