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

import type { AnimationType } from "../animate-in-view/animation-map";
import type { CopyrightPosition } from "../copyright-label/copyright-label";

export type SwiperEffect = "slide" | "fade" | "cube" | "coverflow" | "flip" | "cards" | "creative";

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

export function resolveAnimation(value?: string): AnimationType {
  return value ? (value as AnimationType) : "none";
}

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

export function isNearActive(index: number, activeIndex: number, total: number): boolean {
  const distance = Math.abs(index - activeIndex);
  return Math.min(distance, total - distance) <= PRELOAD_RADIUS;
}
