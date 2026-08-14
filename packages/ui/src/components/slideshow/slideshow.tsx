"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import type {
  CardsEffectOptions,
  CoverflowEffectOptions,
  CreativeEffectOptions,
  CubeEffectOptions,
  FadeEffectOptions,
  FlipEffectOptions,
  Swiper as SwiperType,
  SwiperModule,
} from "swiper/types";

import { AnimateInView, type AnimationType } from "../animate-in-view/animate-in-view";
import { ASCII_TAPE } from "../ascii-art/banners";
import { Box } from "../box/box";
import { CopyrightLabel, type CopyrightPosition } from "../copyright-label/copyright-label";
import { IconButton } from "../icon-button/icon-button";
import { ImageOverlay, type OverlayPattern } from "../image-overlay/image-overlay";
import { Image } from "../image/image";
import { HStack } from "../stack/stack";
import { Video } from "../video/video";

const SWIPER_FADE_EFFECT: FadeEffectOptions = {
  crossFade: true,
};

const SWIPER_CUBE_EFFECT: CubeEffectOptions = {
  shadow: true,
  slideShadows: true,
  shadowOffset: 20,
  shadowScale: 0.94,
};

const SWIPER_COVERFLOW_EFFECT: CoverflowEffectOptions = {
  rotate: 50,
  stretch: 0,
  depth: 100,
  modifier: 1,
  slideShadows: true,
};

const SWIPER_FLIP_EFFECT: FlipEffectOptions = {
  slideShadows: true,
  limitRotation: true,
};

const SWIPER_CARDS_EFFECT: CardsEffectOptions = {
  slideShadows: true,
};

const SWIPER_CREATIVE_EFFECT: CreativeEffectOptions = {
  prev: {
    shadow: true,
    translate: ["-20%", 0, -1],
  },
  next: {
    translate: ["100%", 0, 0],
  },
};

/**
 * How long a held clip may take to start before the carousel moves on. A clip
 * whose request never resolves fires neither `ended` nor `error`, and holding
 * for it forever leaves the visitor on an empty frame.
 */
export const VIDEO_START_TIMEOUT_MS = 8000;

interface SlideshowVideoSlideProps {
  videoUrl: string;
  videoPoster?: string;
  aspectRatio: string;
  holdUntilEnded: boolean;
  isActive: boolean;
  onFinished: () => void;
  onUnplayable: (videoUrl: string) => void;
}

function SlideshowVideoSlide({
  videoUrl,
  videoPoster,
  aspectRatio,
  holdUntilEnded,
  isActive,
  onFinished,
  onUnplayable,
}: SlideshowVideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !holdUntilEnded) {
      return;
    }
    if (!isActive) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    let isDone = false;
    let startTimer: ReturnType<typeof setTimeout>;
    const finish = () => {
      if (isDone) {
        return;
      }
      isDone = true;
      clearTimeout(startTimer);
      onFinished();
    };
    const giveUp = () => {
      if (isDone) {
        return;
      }
      onUnplayable(videoUrl);
      finish();
    };
    const cancelTimeout = () => clearTimeout(startTimer);

    startTimer = setTimeout(giveUp, VIDEO_START_TIMEOUT_MS);

    video.addEventListener("ended", finish);
    video.addEventListener("error", giveUp);
    video.addEventListener("playing", cancelTimeout);
    video.currentTime = 0;
    video.play?.()?.catch(giveUp);

    return () => {
      isDone = true;
      clearTimeout(startTimer);
      video.removeEventListener("ended", finish);
      video.removeEventListener("error", giveUp);
      video.removeEventListener("playing", cancelTimeout);
    };
  }, [holdUntilEnded, isActive, onFinished, onUnplayable, videoUrl]);

  return (
    <Video
      src={videoUrl}
      poster={videoPoster}
      aspectRatio={aspectRatio}
      objectFit="cover"
      mediaRef={videoRef}
      autoPlay={!holdUntilEnded || isActive}
      muted
      loop={!holdUntilEnded}
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
  copyrightSource?: string;
  copyrightPosition?: CopyrightPosition;
  focus?: string;
  videoUrl?: string;
  videoPoster?: string;
  srcSet?: string;
}

export type SwiperEffect = "slide" | "fade" | "cube" | "coverflow" | "flip" | "cards" | "creative";

const PRELOAD_RADIUS = 1;

function isNearActive(index: number, activeIndex: number, total: number): boolean {
  const distance = Math.abs(index - activeIndex);
  return Math.min(distance, total - distance) <= PRELOAD_RADIUS;
}

const EFFECT_MODULES: Record<SwiperEffect, SwiperModule | undefined> = {
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
  // Keyed by source rather than by position: the Visual Editor reorders and
  // deletes slides, and an index remembered across that names a different one.
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

  // A clip that already failed once is not worth a second wait, and its slide
  // renders as an empty frame, so pass straight over it on the next lap.
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
