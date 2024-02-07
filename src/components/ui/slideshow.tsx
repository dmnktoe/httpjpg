import { useCallback, useRef } from 'react';
import * as React from 'react';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import NextImage from '@/components/ui/NextImage';

interface SlideshowProps {
  images: string[];
}

const SlideshowButtons = ({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) => {
  return (
    <>
      <div className='absolute right-8 top-4 z-20'>
        <div className='flex flex-row gap-3'>
          <button onClick={onPrev}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 32 32'
              className='w-8 -rotate-90 transform text-white/35 transition-all hover:text-white md:w-12 lg:w-16'
              fill='currentColor'
            >
              <path d='m26.71 10.29-10-10a1 1 0 0 0-1.41 0l-10 10 1.41 1.41L15 3.41V32h2V3.41l8.29 8.29z' />
            </svg>
          </button>
          <button onClick={onNext}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 32 32'
              className='w-8 rotate-90 transform text-white/35 transition-all hover:text-white md:w-12 lg:w-16'
              fill='currentColor'
            >
              <path d='m26.71 10.29-10-10a1 1 0 0 0-1.41 0l-10 10 1.41 1.41L15 3.41V32h2V3.41l8.29 8.29z' />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export const Slideshow = ({ images }: SlideshowProps) => {
  const swiperElRef = useRef<SwiperRef>(null);

  const handlePrev = useCallback(() => {
    swiperElRef.current?.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    swiperElRef.current?.swiper.slideNext();
  }, []);

  return (
    <div className='relative'>
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        speed={1}
        spaceBetween={15}
        ref={swiperElRef}
        autoplay={{
          delay: 7000,
          disableOnInteraction: false,
        }}
        loop={true}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <NextImage
              width={2500}
              height={1200}
              src={image}
              className='w-full'
              alt={`Slide ${index + 1}`}
              useSkeleton={true}
              key={index}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <SlideshowButtons onPrev={handlePrev} onNext={handleNext} />
    </div>
  );
};

export default Slideshow;
