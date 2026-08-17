import {
  EffectCards,
  EffectCoverflow,
  EffectCreative,
  EffectCube,
  EffectFade,
  EffectFlip,
} from "swiper/modules";
import type {
  CardsEffectOptions,
  CoverflowEffectOptions,
  CreativeEffectOptions,
  CubeEffectOptions,
  FadeEffectOptions,
  FlipEffectOptions,
  SwiperModule,
} from "swiper/types";

export type SwiperEffect = "slide" | "fade" | "cube" | "coverflow" | "flip" | "cards" | "creative";

export const SWIPER_FADE_EFFECT: FadeEffectOptions = {
  crossFade: true,
};

export const SWIPER_CUBE_EFFECT: CubeEffectOptions = {
  shadow: true,
  slideShadows: true,
  shadowOffset: 20,
  shadowScale: 0.94,
};

export const SWIPER_COVERFLOW_EFFECT: CoverflowEffectOptions = {
  rotate: 50,
  stretch: 0,
  depth: 100,
  modifier: 1,
  slideShadows: true,
};

export const SWIPER_FLIP_EFFECT: FlipEffectOptions = {
  slideShadows: true,
  limitRotation: true,
};

export const SWIPER_CARDS_EFFECT: CardsEffectOptions = {
  slideShadows: true,
};

export const SWIPER_CREATIVE_EFFECT: CreativeEffectOptions = {
  prev: {
    shadow: true,
    translate: ["-20%", 0, -1],
  },
  next: {
    translate: ["100%", 0, 0],
  },
};

export const EFFECT_MODULES: Record<SwiperEffect, SwiperModule | undefined> = {
  slide: undefined,
  fade: EffectFade,
  cube: EffectCube,
  coverflow: EffectCoverflow,
  flip: EffectFlip,
  cards: EffectCards,
  creative: EffectCreative,
};

const PRELOAD_RADIUS = 1;

/** Fade stacks slides with opacity; Swiper loop duplicates break that. */
const LOOP_UNSUPPORTED_EFFECTS = new Set<SwiperEffect>(["fade"]);

export interface SlideshowNavigationMode {
  loop: boolean;
  rewind: boolean;
}

export function slideshowNavigationMode(
  effect: SwiperEffect,
  slideCount: number,
): SlideshowNavigationMode {
  if (slideCount <= 1) {
    return { loop: false, rewind: false };
  }
  if (LOOP_UNSUPPORTED_EFFECTS.has(effect)) {
    return { loop: false, rewind: true };
  }
  return { loop: true, rewind: false };
}

export function resolveSlideIndex(swiper: {
  params: { loop?: boolean };
  realIndex?: number;
  activeIndex?: number;
}): number {
  if (swiper.params.loop) {
    return swiper.realIndex ?? 0;
  }
  return swiper.activeIndex ?? 0;
}

export function isNearActive(index: number, activeIndex: number, total: number): boolean {
  const distance = Math.abs(index - activeIndex);
  return Math.min(distance, total - distance) <= PRELOAD_RADIUS;
}
