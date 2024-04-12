'use client';

import React, { useCallback, useRef } from 'react';
// @ts-expect-error - https://github.com/microsoft/TypeScript/issues/52529
import { Autoplay, Navigation } from 'swiper/modules';
// @ts-expect-error - https://github.com/microsoft/TypeScript/issues/52529
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import type { ImageAspectRatioType, PaddingType } from '@/data/datasource';

import {
  type AnimationType,
  AnimateInView,
} from '@/components/helpers/Animate';
import { WidthBox, WidthType } from '@/components/layout/WidthBox';
import { Image } from '@/components/ui/Image';

import { SbImageType } from '@/types/SbFields.types';

type SlideshowProps = React.HTMLAttributes<HTMLDivElement> & {
  animation?: AnimationType;
  aspectRatio?: ImageAspectRatioType;
  boundingWidth?: 'container' | 'full';
  delay?: number;
  images: SbImageType[];
  spacingBottom?: PaddingType;
  spacingTop?: PaddingType;
  speed?: number;
  width?: WidthType;
};
export const Slideshow = ({
  animation = 'none',
  aspectRatio = '16x9',
  boundingWidth = 'full',
  delay,
  images,
  spacingBottom,
  spacingTop,
  speed = 1,
  width,
  ...props
}: SlideshowProps) => {
  const swiperElRef = useRef<SwiperRef>(null);

  const handlePrev = useCallback(() => {
    swiperElRef.current?.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    swiperElRef.current?.swiper.slideNext();
  }, []);

  return (
    <WidthBox
      {...props}
      boundingWidth={boundingWidth}
      width={width}
      pt={spacingTop}
      pb={spacingBottom}
    >
      <AnimateInView animation={animation} delay={delay}>
        <div className='relative'>
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            speed={speed}
            spaceBetween={15}
            ref={swiperElRef}
            autoplay={{
              delay: 7000,
              disableOnInteraction: false,
            }}
            loop={images.length > 1}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className='relative block h-full w-full'>
                  <Image
                    alt={image.alt}
                    aspectRatio={aspectRatio}
                    imageSrc={image.filename || ''}
                    imageFocus={image.focus}
                    isCaptionInset
                    key={index}
                    className='z-0'
                  />
                  {image.copyright && (
                    <div className='absolute -right-8 bottom-12 z-10 -rotate-90 text-xs text-black'>
                      &copy; {image.copyright}
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {images.length > 1 && (
            <SlideshowButtons onPrev={handlePrev} onNext={handleNext} />
          )}
        </div>
      </AnimateInView>
    </WidthBox>
  );
};

const SlideshowButtons = ({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) => {
  const LeftArrow = () => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 32 32'
      className='w-8 -rotate-90 transform text-white transition-all hover:text-white md:w-12 lg:w-16 xl:text-white/35'
      fill='currentColor'
    >
      <path d='m26.71 10.29-10-10a1 1 0 0 0-1.41 0l-10 10 1.41 1.41L15 3.41V32h2V3.41l8.29 8.29z' />
    </svg>
  );

  const RightArrow = () => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 32 32'
      className='w-8 rotate-90 transform text-white transition-all hover:text-white md:w-12 lg:w-16 xl:text-white/35'
      fill='currentColor'
    >
      <path d='m26.71 10.29-10-10a1 1 0 0 0-1.41 0l-10 10 1.41 1.41L15 3.41V32h2V3.41l8.29 8.29z' />
    </svg>
  );

  return (
    <>
      <div className='absolute right-8 top-4 z-20'>
        <div className='flex flex-row gap-3'>
          <button onClick={onPrev}>
            <LeftArrow />
          </button>
          <button onClick={onNext}>
            <RightArrow />
          </button>
        </div>
      </div>
    </>
  );
};

export default Slideshow;
